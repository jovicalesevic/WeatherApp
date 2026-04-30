import logging
import time
import uuid

import httpx
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .cache import InMemoryTTLCache
from .config import get_settings
from .rate_limit import InMemoryRateLimiter

settings = get_settings()
app = FastAPI(title="WeatherApp Backend", version="0.1.0")
cache = InMemoryTTLCache(ttl_seconds=settings.cache_ttl_seconds)
rate_limiter = InMemoryRateLimiter(max_requests_per_minute=settings.rate_limit_per_minute)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s request_id=%(request_id)s message=%(message)s",
)
logger = logging.getLogger("weatherapp-backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.allowed_origin],
    allow_credentials=False,
    allow_methods=["GET"],
    allow_headers=["*"],
)


def build_cache_key(city: str | None, lat: float | None, lon: float | None, lang: str) -> str:
    if city:
        return f"city:{city.lower()}:{lang}"
    return f"coords:{lat}:{lon}:{lang}"


@app.get("/health")
def health():
    return {
        "ok": True,
        "cache_ttl_seconds": settings.cache_ttl_seconds,
        "rate_limit_per_minute": settings.rate_limit_per_minute,
    }


@app.get("/api/weather")
async def weather(
    request: Request,
    city: str | None = None,
    lat: float | None = None,
    lon: float | None = None,
    lang: str = "sr",
):
    request_id = str(uuid.uuid4())[:8]
    start = time.perf_counter()
    client_ip = request.client.host if request.client else "unknown"

    if not rate_limiter.allow(client_ip):
        return JSONResponse(
            status_code=429,
            content={"error": "rate_limited", "details": "Too many requests."},
            headers={"x-request-id": request_id},
        )

    if not settings.openweather_api_key:
        return JSONResponse(
            status_code=500,
            content={"error": "misconfigured_backend", "details": "OPENWEATHER_API_KEY is missing."},
            headers={"x-request-id": request_id},
        )

    if city is None and (lat is None or lon is None):
        return JSONResponse(
            status_code=400,
            content={"error": "invalid_request", "details": "Use city or lat/lon parameters."},
            headers={"x-request-id": request_id},
        )

    cache_key = build_cache_key(city=city, lat=lat, lon=lon, lang=lang)
    cached = cache.get(cache_key)
    if cached is not None:
        elapsed_ms = round((time.perf_counter() - start) * 1000, 2)
        logger.info(
            "cache_hit",
            extra={"request_id": request_id},
        )
        return JSONResponse(
            status_code=200,
            content=cached,
            headers={"x-cache": "HIT", "x-request-id": request_id, "x-response-time-ms": str(elapsed_ms)},
        )

    params = {
        "appid": settings.openweather_api_key,
        "units": "metric",
        "lang": "en" if lang == "en" else "sr",
    }
    if city:
        params["q"] = city
    else:
        params["lat"] = lat
        params["lon"] = lon

    try:
        async with httpx.AsyncClient(timeout=8) as client:
            response = await client.get("https://api.openweathermap.org/data/2.5/weather", params=params)
            payload = response.json()
    except httpx.HTTPError:
        return JSONResponse(
            status_code=503,
            content={"error": "upstream_unavailable", "details": "Weather provider request failed."},
            headers={"x-request-id": request_id},
        )

    elapsed_ms = round((time.perf_counter() - start) * 1000, 2)
    logger.info(
        "upstream_response status=%s duration_ms=%s",
        response.status_code,
        elapsed_ms,
        extra={"request_id": request_id},
    )

    if response.status_code != 200:
        return JSONResponse(
            status_code=response.status_code,
            content=payload,
            headers={"x-cache": "MISS", "x-request-id": request_id, "x-response-time-ms": str(elapsed_ms)},
        )

    cache.set(cache_key, payload)
    return JSONResponse(
        status_code=200,
        content=payload,
        headers={"x-cache": "MISS", "x-request-id": request_id, "x-response-time-ms": str(elapsed_ms)},
    )
