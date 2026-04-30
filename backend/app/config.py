import os
from dataclasses import dataclass

from dotenv import load_dotenv

load_dotenv()


@dataclass(frozen=True)
class Settings:
    openweather_api_key: str
    cache_ttl_seconds: int
    rate_limit_per_minute: int
    allowed_origin: str


def get_settings() -> Settings:
    return Settings(
        openweather_api_key=os.getenv("OPENWEATHER_API_KEY", ""),
        cache_ttl_seconds=int(os.getenv("CACHE_TTL_SECONDS", "300")),
        rate_limit_per_minute=int(os.getenv("RATE_LIMIT_PER_MINUTE", "60")),
        allowed_origin=os.getenv("ALLOWED_ORIGIN", "http://127.0.0.1:5500"),
    )
