import { MAX_RECENT_SEARCHES, STORAGE_KEYS } from './config.js';
import { normalizeLang } from './i18n.js';

export function getLanguage() {
    return normalizeLang(localStorage.getItem(STORAGE_KEYS.language) || 'sr');
}

export function saveLanguage(language) {
    localStorage.setItem(STORAGE_KEYS.language, normalizeLang(language));
}

export function getLastCity() {
    return localStorage.getItem(STORAGE_KEYS.lastCity) || '';
}

export function saveLastCity(city) {
    localStorage.setItem(STORAGE_KEYS.lastCity, city);
}

export function loadRecentSearches() {
    try {
        const parsed = JSON.parse(localStorage.getItem(STORAGE_KEYS.recentSearches) || '[]');
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

export function saveRecentSearches(recentSearches) {
    localStorage.setItem(STORAGE_KEYS.recentSearches, JSON.stringify(recentSearches));
}

export function pushRecentSearch(city) {
    const normalizedCity = city.trim();
    if (!normalizedCity) {
        return;
    }

    const recentSearches = loadRecentSearches();
    const deduplicated = recentSearches.filter((item) => item.toLowerCase() !== normalizedCity.toLowerCase());
    const nextSearches = [normalizedCity, ...deduplicated].slice(0, MAX_RECENT_SEARCHES);
    saveRecentSearches(nextSearches);
    saveLastCity(normalizedCity);
}

export function loadHistory() {
    try {
        const parsed = JSON.parse(localStorage.getItem(STORAGE_KEYS.history) || '[]');
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

export function pushHistoryEntry(entry) {
    const history = loadHistory();
    const now = Date.now();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    const nextHistory = [{ ...entry, at: now }, ...history]
        .filter((item) => now - item.at <= sevenDaysMs)
        .slice(0, 50);
    localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(nextHistory));
}

export function saveLastSnapshot(snapshot) {
    localStorage.setItem(STORAGE_KEYS.lastWeatherSnapshot, JSON.stringify(snapshot));
}

export function loadLastSnapshot() {
    try {
        const parsed = JSON.parse(localStorage.getItem(STORAGE_KEYS.lastWeatherSnapshot) || 'null');
        return parsed && typeof parsed === 'object' ? parsed : null;
    } catch {
        return null;
    }
}
