# WeatherApp

A lightweight, client-side weather dashboard that fetches **current conditions** for any city using the [OpenWeather](https://openweathermap.org/api) **Current Weather Data** API. The UI is responsive, accessibility-aware, and styled with a consistent dark theme aligned with the author’s portfolio.

**Live demo:** [https://jovicalesevic.github.io/WeatherApp/](https://jovicalesevic.github.io/WeatherApp/)

---

## Features

- **City search** — Enter a city name and press **Search** or **Enter** to load weather data.
- **OpenWeather API integration** — Real-time data via `api.openweathermap.org` (metric units, SR/EN descriptions).
- **Rich current snapshot** — Temperature, condition text, humidity, wind speed, feels-like, pressure, and official OpenWeather condition icons.
- **UX polish** — Loading spinner, clear error messages (e.g. city not found, network issues), and `aria-live` feedback for assistive technologies.
- **Geolocation + persistence** — One-click "My location", recent city chips, and last city auto-load with `localStorage`.
- **Language toggle** — Instant switch between Serbian and English labels/messages.
- **Dark-themed UI** — Single cohesive dark palette (CSS custom properties), typography via Google Fonts (**Inter**), and a layout that works on mobile and desktop.

---

## Tech stack

| Layer   | Technology        |
|--------|-------------------|
| Markup | HTML5             |
| Styles | CSS3 (variables, grid/flexbox) |
| Logic  | Vanilla JavaScript (ES modules) |

---

## OpenWeather API

This project uses the **OpenWeather** [Current Weather Data](https://openweathermap.org/current) endpoint. You need a free API key from [OpenWeather](https://openweathermap.org/api):

1. Create an account and open **API keys** in the dashboard.
2. In `js/config.js`, set your key on the `API_KEY` constant.

Weather icons are loaded from OpenWeather’s CDN (`openweathermap.org/img/wn/…`). Usage of OpenWeather data and branding is subject to [OpenWeather’s terms](https://openweathermap.org/terms).

---

## Installation & run locally

No build step or package manager is required.

1. **Clone** the repository:
   ```bash
   git clone https://github.com/jovicalesevic/WeatherApp.git
   cd WeatherApp
   ```
2. **Open** `index.html` in your browser (double-click or use “Open with Live Server” / your editor’s static preview).

For full API functionality, ensure `js/config.js` contains a valid OpenWeather API key and that your environment allows `fetch` requests to the OpenWeather API.

---

## License

This project is released under the [MIT License](LICENSE).

---

## Author

**Jovica Lešević**
