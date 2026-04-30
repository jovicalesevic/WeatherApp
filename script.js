/**
 * WeatherApp - OpenWeatherMap API integracija
 * 
 * VAŽNO: Unesi svoj API ključ ispod!
 * Dobijaš ga besplatno na: https://openweathermap.org/api
 * Registruj se → API keys tab → kopiraj ključ
 */

// ═══════════════════════════════════════════════════════════════
// UNESI SVOJ API KLJUČ OVDE (između navodnika):
// ═══════════════════════════════════════════════════════════════
const API_KEY = '79780fde196ffc4ae9ff14c72a1e8e84';
// ═══════════════════════════════════════════════════════════════

const API_BASE = 'https://api.openweathermap.org/data/2.5/weather';
const RECENT_SEARCHES_KEY = 'weather_recent_searches';
const LAST_CITY_KEY = 'weather_last_city';
const MAX_RECENT_SEARCHES = 5;

// DOM elementi
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const geoBtn = document.getElementById('geoBtn');
const recentSearchesEl = document.getElementById('recentSearches');
const errorMsg = document.getElementById('errorMsg');
const loadingState = document.getElementById('loadingState');
const weatherCard = document.getElementById('weatherCard');
const cityNameEl = document.getElementById('cityName');
const weatherIconEl = document.getElementById('weatherIcon');
const weatherDescEl = document.getElementById('weatherDesc');
const temperatureEl = document.getElementById('temperature');
const humidityEl = document.getElementById('humidity');
const windSpeedEl = document.getElementById('windSpeed');
const feelsLikeEl = document.getElementById('feelsLike');
const pressureEl = document.getElementById('pressure');
const lastUpdatedEl = document.getElementById('lastUpdated');

/**
 * Fetchuje trenutne vremenske podatke sa OpenWeatherMap API-ja
 * @param {string} city - Ime grada za pretragu
 * @returns {Promise<Object|null>} - Vremenski podaci ili null pri grešci
 */
async function fetchWeatherData(city) {
    const url = `${API_BASE}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=sr`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        // Grad nije pronađen (404)
        if (data.cod === '404' || data.cod === 404) {
            throw new Error('Grad nije pronađen. Proverite unos i pokušajte ponovo.');
        }

        // Ostale greške API-ja (npr. nedostaje API key)
        if (!response.ok) {
            throw new Error(data.message || 'Došlo je do greške pri učitavanju podataka.');
        }

        return data;
    } catch (err) {
        if (err instanceof TypeError && err.message.includes('fetch')) {
            throw new Error('Problem sa internet konekcijom. Proverite povezivanje.');
        }
        throw err;
    }
}

/**
 * Fetchuje trenutne vremenske podatke po koordinatama
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<Object>}
 */
async function fetchWeatherDataByCoords(lat, lon) {
    const url = `${API_BASE}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=sr`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Ne mogu da učitam vreme za tvoju lokaciju.');
    }

    return data;
}

function formatLocalTime(unixSeconds, timezoneOffsetSeconds) {
    const utcMs = unixSeconds * 1000;
    const localMs = utcMs + timezoneOffsetSeconds * 1000;
    const date = new Date(localMs);

    return date.toLocaleTimeString('sr-RS', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC'
    });
}

function loadRecentSearches() {
    try {
        const parsed = JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || '[]');
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function saveRecentSearches(recentSearches) {
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recentSearches));
}

function renderRecentSearches() {
    const recentSearches = loadRecentSearches();

    if (!recentSearches.length) {
        recentSearchesEl.innerHTML = '';
        return;
    }

    const chips = recentSearches
        .map((city) => `<button type="button" class="recent-searches__chip" data-city="${city}">${city}</button>`)
        .join('');

    recentSearchesEl.innerHTML = `<p class="recent-searches__label">Skorašnje pretrage</p>${chips}`;
}

function storeSearchHistory(city) {
    const normalizedCity = city.trim();
    if (!normalizedCity) {
        return;
    }

    const recentSearches = loadRecentSearches();
    const deduplicated = recentSearches.filter((item) => item.toLowerCase() !== normalizedCity.toLowerCase());
    const nextSearches = [normalizedCity, ...deduplicated].slice(0, MAX_RECENT_SEARCHES);

    saveRecentSearches(nextSearches);
    localStorage.setItem(LAST_CITY_KEY, normalizedCity);
    renderRecentSearches();
}

/**
 * Prikazuje poruku o grešci
 */
function showError(message) {
    errorMsg.textContent = message;
    errorMsg.classList.add('visible');
    errorMsg.setAttribute('aria-hidden', 'false');
}

/**
 * Sakriva poruku o grešci
 */
function hideError() {
    errorMsg.textContent = '';
    errorMsg.classList.remove('visible');
    errorMsg.setAttribute('aria-hidden', 'true');
}

/**
 * Prikazuje loading stanje
 */
function showLoading() {
    loadingState.classList.add('visible');
    loadingState.setAttribute('aria-hidden', 'false');
    weatherCard.classList.remove('visible');
    weatherCard.setAttribute('aria-hidden', 'true');
}

/**
 * Sakriva loading stanje
 */
function hideLoading() {
    loadingState.classList.remove('visible');
    loadingState.setAttribute('aria-hidden', 'true');
}

/**
 * Prikazuje vremensku karticu sa podacima
 */
function displayWeather(data) {
    const { name, main, wind, weather, dt, timezone } = data;

    cityNameEl.textContent = name;
    weatherDescEl.textContent = weather[0].description;
    temperatureEl.textContent = Math.round(main.temp);
    humidityEl.textContent = `${main.humidity}%`;
    windSpeedEl.textContent = `${Math.round(wind.speed)} m/s`;
    feelsLikeEl.textContent = `${Math.round(main.feels_like)} °C`;
    pressureEl.textContent = `${main.pressure} hPa`;
    lastUpdatedEl.textContent = `Ažurirano: ${formatLocalTime(dt, timezone)}`;

    const iconCode = weather[0].icon;
    weatherIconEl.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    weatherIconEl.alt = weather[0].description;

    weatherCard.classList.add('visible');
    weatherCard.setAttribute('aria-hidden', 'false');
}

/**
 * Glavna funkcija za pretragu vremena
 */
async function searchWeather() {
    const city = cityInput.value.trim();

    if (!city) {
        showError('Unesite ime grada.');
        return;
    }

    hideError();
    showLoading();

    try {
        const data = await fetchWeatherData(city);
        hideLoading();
        displayWeather(data);
        storeSearchHistory(data.name);
    } catch (err) {
        hideLoading();
        showError(err.message || 'Došlo je do neočekivane greške.');
    }
}

function searchWeatherByCity(city) {
    cityInput.value = city;
    searchWeather();
}

function requestCurrentPosition() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolokacija nije podržana u ovom pregledaču.'));
            return;
        }

        navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000
        });
    });
}

async function searchWeatherByLocation() {
    hideError();
    showLoading();

    try {
        const position = await requestCurrentPosition();
        const { latitude, longitude } = position.coords;
        const data = await fetchWeatherDataByCoords(latitude, longitude);

        hideLoading();
        displayWeather(data);
        storeSearchHistory(data.name);
    } catch (err) {
        hideLoading();

        if (err.code === 1) {
            showError('Pristup lokaciji je odbijen. Dozvoli geolokaciju ili unesi grad ručno.');
            return;
        }

        if (err.code === 2 || err.code === 3) {
            showError('Lokacija trenutno nije dostupna. Pokušaj ponovo za par sekundi.');
            return;
        }

        showError(err.message || 'Ne mogu da učitam vreme za trenutnu lokaciju.');
    }
}

function hydrateLastCity() {
    const lastCity = localStorage.getItem(LAST_CITY_KEY);
    if (lastCity) {
        cityInput.value = lastCity;
        searchWeatherByCity(lastCity);
    }
}

// Event listeners
searchBtn.addEventListener('click', searchWeather);
geoBtn.addEventListener('click', searchWeatherByLocation);

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchWeather();
    }
});

recentSearchesEl.addEventListener('click', (e) => {
    const chip = e.target.closest('.recent-searches__chip');
    if (!chip) {
        return;
    }
    searchWeatherByCity(chip.dataset.city || '');
});

renderRecentSearches();
hydrateLastCity();
