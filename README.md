# WeatherApp

A lightweight weather dashboard with a static frontend and a FastAPI backend proxy for OpenWeather. The UI is responsive, accessibility-aware, and styled with a consistent dark theme aligned with the author’s portfolio.

**Live demo:** [https://jovicalesevic.github.io/WeatherApp/](https://jovicalesevic.github.io/WeatherApp/)

---

## Features

- **City search** — Enter a city name and press **Search** or **Enter** to load weather data.
- **OpenWeather API integration** — Real-time data via `api.openweathermap.org` (metric units, SR/EN descriptions).
- **Rich current snapshot** — Temperature, condition text, humidity, wind speed, feels-like, pressure, and official OpenWeather condition icons.
- **UX polish** — Loading spinner, clear error messages (e.g. city not found, network issues), and `aria-live` feedback for assistive technologies.
- **Geolocation + persistence** — One-click "My location", recent city chips, and last city auto-load with `localStorage`.
- **Language toggle** — Instant switch between Serbian and English labels/messages.
- **Mini analytics** — Tracks number of weather lookups and average temperature over the last 7 days.
- **PWA-ready** — Install prompt support, web app manifest, and service worker app-shell caching.
- **Backend API layer (v2)** — FastAPI proxy hides API key, applies rate limits, adds cache, and logs request metadata.
- **Dark-themed UI** — Single cohesive dark palette (CSS custom properties), typography via Google Fonts (**Inter**), and a layout that works on mobile and desktop.

---

## Tech stack

| Layer   | Technology        |
|--------|-------------------|
| Markup | HTML5             |
| Styles | CSS3 (variables, grid/flexbox) |
| Logic  | Vanilla JavaScript (ES modules) |
| Backend | FastAPI + httpx (Python) |
| Offline/Install | Web App Manifest + Service Worker |

---

## OpenWeather API + Backend proxy

This project uses the **OpenWeather** [Current Weather Data](https://openweathermap.org/current) endpoint via the backend proxy.

1. Create an account and open **API keys** in the dashboard.
2. Create `backend/.env` from `backend/.env.example`.
3. Set `OPENWEATHER_API_KEY` in `backend/.env`.

Weather icons are loaded from OpenWeather’s CDN (`openweathermap.org/img/wn/…`). Usage of OpenWeather data and branding is subject to [OpenWeather’s terms](https://openweathermap.org/terms).

---

## Installation & run locally

### 1) Backend (FastAPI)

```bash
git clone https://github.com/jovicalesevic/WeatherApp.git
cd WeatherApp/backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

### 2) Frontend (static)

Serve the project root with any static server (e.g. Live Server extension) and open `index.html`.

Frontend default API target is `http://localhost:8000/api/weather`.  
You can override it via `window.WEATHER_API_BASE_URL` if needed.

---

## License

This project is released under the [MIT License](LICENSE).

---

## Author

**Jovica Lešević**
