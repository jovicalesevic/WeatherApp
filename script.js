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

// DOM elementi
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const errorMsg = document.getElementById('errorMsg');
const loadingState = document.getElementById('loadingState');
const weatherCard = document.getElementById('weatherCard');
const cityNameEl = document.getElementById('cityName');
const weatherIconEl = document.getElementById('weatherIcon');
const weatherDescEl = document.getElementById('weatherDesc');
const temperatureEl = document.getElementById('temperature');
const humidityEl = document.getElementById('humidity');
const windSpeedEl = document.getElementById('windSpeed');

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
    const { name, main, wind, weather } = data;

    cityNameEl.textContent = name;
    weatherDescEl.textContent = weather[0].description;
    temperatureEl.textContent = Math.round(main.temp);
    humidityEl.textContent = `${main.humidity}%`;
    windSpeedEl.textContent = `${Math.round(wind.speed)} m/s`;

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
    } catch (err) {
        hideLoading();
        showError(err.message || 'Došlo je do neočekivane greške.');
    }
}

// Event listeners
searchBtn.addEventListener('click', searchWeather);

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchWeather();
    }
});
