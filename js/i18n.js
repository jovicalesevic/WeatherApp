const translations = {
    sr: {
        inputPlaceholder: 'Unesite ime grada...',
        search: 'Pretraži',
        myLocation: 'Moja lokacija',
        recentLabel: 'Skorašnje pretrage',
        updatedAt: 'Ažurirano:',
        labelHumidity: 'Vlažnost',
        labelWind: 'Brzina vetra',
        labelFeelsLike: 'Osećaj',
        labelPressure: 'Pritisak',
        errEmptyCity: 'Unesite ime grada.',
        errCityNotFound: 'Grad nije pronađen. Proverite unos i pokušajte ponovo.',
        errConnection: 'Problem sa internet konekcijom. Proverite povezivanje.',
        errUnexpected: 'Došlo je do neočekivane greške.',
        errGeoUnsupported: 'Geolokacija nije podržana u ovom pregledaču.',
        errGeoDenied: 'Pristup lokaciji je odbijen. Dozvoli geolokaciju ili unesi grad ručno.',
        errGeoUnavailable: 'Lokacija trenutno nije dostupna. Pokušaj ponovo za par sekundi.',
        errGeoFetch: 'Ne mogu da učitam vreme za trenutnu lokaciju.'
    },
    en: {
        inputPlaceholder: 'Enter city name...',
        search: 'Search',
        myLocation: 'My location',
        recentLabel: 'Recent searches',
        updatedAt: 'Updated:',
        labelHumidity: 'Humidity',
        labelWind: 'Wind speed',
        labelFeelsLike: 'Feels like',
        labelPressure: 'Pressure',
        errEmptyCity: 'Please enter a city name.',
        errCityNotFound: 'City not found. Check your input and try again.',
        errConnection: 'Network issue detected. Please check your connection.',
        errUnexpected: 'An unexpected error occurred.',
        errGeoUnsupported: 'Geolocation is not supported in this browser.',
        errGeoDenied: 'Location access was denied. Enable geolocation or search by city.',
        errGeoUnavailable: 'Location is currently unavailable. Please try again shortly.',
        errGeoFetch: 'Unable to load weather for your current location.'
    }
};

export function t(language, key) {
    return translations[language]?.[key] || translations.sr[key] || key;
}

export function normalizeLang(candidate) {
    return candidate === 'en' ? 'en' : 'sr';
}
