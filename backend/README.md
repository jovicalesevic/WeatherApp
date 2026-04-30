# WeatherApp Backend (FastAPI)

This backend proxies OpenWeather requests so the API key stays server-side.

## Features

- API key concealment (`OPENWEATHER_API_KEY` in backend env)
- In-memory TTL caching (Redis-ready by service abstraction)
- In-memory rate limiting per client IP
- Structured request logging with `x-request-id`
- Health endpoint for quick checks

## Run locally

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

Backend runs at `http://localhost:8000`.

## API

- `GET /health`
- `GET /api/weather?city=Belgrade&lang=sr`
- `GET /api/weather?lat=44.8&lon=20.46&lang=en`
