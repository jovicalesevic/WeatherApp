import { API_BASE, API_KEY } from './config.js';

export async function fetchWeatherByCity(city, language) {
    const url = `${API_BASE}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=${language}`;
    return fetchJson(url);
}

export async function fetchWeatherByCoords(lat, lon, language) {
    const url = `${API_BASE}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=${language}`;
    return fetchJson(url);
}

async function fetchJson(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        return { ok: response.ok, data };
    } catch {
        return { ok: false, data: null, networkError: true };
    }
}
