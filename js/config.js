export const API_BASE = window.WEATHER_API_BASE_URL || 'http://localhost:8000/api/weather';

export const STORAGE_KEYS = {
    recentSearches: 'weather_recent_searches',
    lastCity: 'weather_last_city',
    language: 'weather_language',
    history: 'weather_history',
    lastWeatherSnapshot: 'weather_last_snapshot'
};

export const MAX_RECENT_SEARCHES = 5;
