import { t } from './i18n.js';
import {
    getLanguage,
    getLastCity,
    loadHistory,
    loadLastSnapshot,
    loadRecentSearches,
    pushHistoryEntry,
    pushRecentSearch,
    saveLanguage,
    saveLastSnapshot
} from './storage.js';
import { fetchWeatherByCity, fetchWeatherByCoords } from './weather-api.js';

const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const geoBtn = document.getElementById('geoBtn');
const recentSearchesEl = document.getElementById('recentSearches');
const installPromptEl = document.getElementById('installPrompt');
const installBtn = document.getElementById('installBtn');
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
const analyticsSearchCountEl = document.getElementById('analyticsSearchCount');
const analyticsAverageTempEl = document.getElementById('analyticsAverageTemp');
const languageButtons = document.querySelectorAll('.lang-switch__btn');
const i18nNodes = document.querySelectorAll('[data-i18n]');

let language = getLanguage();
let deferredInstallPrompt = null;

function showError(message) {
    errorMsg.textContent = message;
    errorMsg.classList.add('visible');
    errorMsg.setAttribute('aria-hidden', 'false');
}

function hideError() {
    errorMsg.textContent = '';
    errorMsg.classList.remove('visible');
    errorMsg.setAttribute('aria-hidden', 'true');
}

function showLoading() {
    loadingState.classList.add('visible');
    loadingState.setAttribute('aria-hidden', 'false');
    weatherCard.classList.remove('visible');
    weatherCard.setAttribute('aria-hidden', 'true');
}

function hideLoading() {
    loadingState.classList.remove('visible');
    loadingState.setAttribute('aria-hidden', 'true');
}

function formatLocalTime(unixSeconds, timezoneOffsetSeconds) {
    const utcMs = unixSeconds * 1000;
    const localMs = utcMs + timezoneOffsetSeconds * 1000;
    const date = new Date(localMs);

    return date.toLocaleTimeString(language === 'en' ? 'en-US' : 'sr-RS', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC'
    });
}

function displayWeather(data) {
    const { name, main, wind, weather, dt, timezone } = data;

    cityNameEl.textContent = name;
    weatherDescEl.textContent = weather[0].description;
    temperatureEl.textContent = Math.round(main.temp);
    humidityEl.textContent = `${main.humidity}%`;
    windSpeedEl.textContent = `${Math.round(wind.speed)} m/s`;
    feelsLikeEl.textContent = `${Math.round(main.feels_like)} °C`;
    pressureEl.textContent = `${main.pressure} hPa`;
    lastUpdatedEl.textContent = `${t(language, 'updatedAt')} ${formatLocalTime(dt, timezone)}`;

    weatherIconEl.src = `https://openweathermap.org/img/wn/${weather[0].icon}@2x.png`;
    weatherIconEl.alt = weather[0].description;

    weatherCard.classList.add('visible');
    weatherCard.setAttribute('aria-hidden', 'false');
}

function renderAnalytics() {
    const history = loadHistory();
    const count = history.length;
    const averageTemp = count
        ? Math.round(history.reduce((sum, item) => sum + Number(item.temp || 0), 0) / count)
        : null;

    analyticsSearchCountEl.textContent = String(count);
    analyticsAverageTempEl.textContent = averageTemp === null ? '-' : `${averageTemp} °C`;
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
    recentSearchesEl.innerHTML = `<p class="recent-searches__label">${t(language, 'recentLabel')}</p>${chips}`;
}

function applyTranslations() {
    document.documentElement.lang = language;
    cityInput.placeholder = t(language, 'inputPlaceholder');
    searchBtn.textContent = t(language, 'search');
    geoBtn.textContent = t(language, 'myLocation');

    i18nNodes.forEach((node) => {
        node.textContent = t(language, node.dataset.i18n);
    });

    languageButtons.forEach((button) => {
        button.classList.toggle('active', button.dataset.lang === language);
    });

    renderRecentSearches();
    renderAnalytics();
}

function resolveApiError(result) {
    if (result.networkError) {
        return t(language, 'errConnection');
    }

    if (!result.ok && (result.data?.cod === 404 || result.data?.cod === '404')) {
        return t(language, 'errCityNotFound');
    }

    return result.data?.message || t(language, 'errUnexpected');
}

async function searchWeather() {
    const city = cityInput.value.trim();
    if (!city) {
        showError(t(language, 'errEmptyCity'));
        return;
    }

    hideError();
    showLoading();

    const result = await fetchWeatherByCity(city, language);
    hideLoading();

    if (!result.ok) {
        showError(resolveApiError(result));
        return;
    }

    displayWeather(result.data);
    pushRecentSearch(result.data.name);
    pushHistoryEntry({ temp: result.data.main.temp, city: result.data.name });
    saveLastSnapshot(result.data);
    renderRecentSearches();
    renderAnalytics();
}

function requestCurrentPosition() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error(t(language, 'errGeoUnsupported')));
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
        const result = await fetchWeatherByCoords(latitude, longitude, language);
        hideLoading();

        if (!result.ok) {
            showError(resolveApiError(result));
            return;
        }

        displayWeather(result.data);
        pushRecentSearch(result.data.name);
        pushHistoryEntry({ temp: result.data.main.temp, city: result.data.name });
        saveLastSnapshot(result.data);
        renderRecentSearches();
        renderAnalytics();
    } catch (err) {
        hideLoading();

        if (err.code === 1) {
            showError(t(language, 'errGeoDenied'));
            return;
        }

        if (err.code === 2 || err.code === 3) {
            showError(t(language, 'errGeoUnavailable'));
            return;
        }

        showError(err.message || t(language, 'errGeoFetch'));
    }
}

function hydrateLastCity() {
    const lastCity = getLastCity();
    if (!lastCity) {
        return;
    }

    cityInput.value = lastCity;
    searchWeather();
}

function showOfflineSnapshot() {
    const snapshot = loadLastSnapshot();
    if (!snapshot) {
        return false;
    }

    displayWeather(snapshot);
    showError(t(language, 'offlineSnapshot'));
    return true;
}

function setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (event) => {
        event.preventDefault();
        deferredInstallPrompt = event;
        installPromptEl.hidden = false;
    });

    window.addEventListener('appinstalled', () => {
        installPromptEl.hidden = true;
        deferredInstallPrompt = null;
    });

    installBtn.addEventListener('click', async () => {
        if (!deferredInstallPrompt) {
            return;
        }

        deferredInstallPrompt.prompt();
        await deferredInstallPrompt.userChoice;
        deferredInstallPrompt = null;
        installPromptEl.hidden = true;
    });
}

function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
        return;
    }

    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js');
    });
}

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

    cityInput.value = chip.dataset.city || '';
    searchWeather();
});

languageButtons.forEach((button) => {
    button.addEventListener('click', () => {
        language = button.dataset.lang === 'en' ? 'en' : 'sr';
        saveLanguage(language);
        applyTranslations();
    });
});

applyTranslations();
hydrateLastCity();
setupInstallPrompt();
registerServiceWorker();

if (!navigator.onLine) {
    showOfflineSnapshot();
}
