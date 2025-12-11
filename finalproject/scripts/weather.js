import { 
    LoadingSpinner, 
    Storage, 
    FormValidator, 
    debounce,
    displayErrorMessage,
    initializeCommon 
} from './main.js';

// API Configuration
const WEATHER_API_KEY = 'cd2d094e1adbb9c4c2055c1f34b4a2e1'; // Replace with your actual key

// Initialize common functionality
initializeCommon();

// DOM Elements
const locationSearchInput = document.getElementById('location-search-input');
const locationSearchBtn = document.getElementById('location-search-btn');
const useLocationBtn = document.getElementById('use-location-btn');
const locationNameDisplay = document.getElementById('location-name');
const currentWeatherCard = document.getElementById('current-weather-card');
const weatherDetails = document.getElementById('weather-details');
const forecastContainer = document.getElementById('forecast-container');
const savedLocationsGrid = document.getElementById('saved-locations-grid');
const noLocationsMessage = document.getElementById('no-locations-message');
const addLocationBtn = document.getElementById('add-location-btn');
const addLocationModal = document.getElementById('add-location-modal');
const locationForm = document.getElementById('location-form');
const weatherLoading = document.getElementById('weather-loading');
const suggestionsList = document.getElementById('suggestions');


// State variables
let currentLocation = Storage.get('weather-location') || 'Caracas';
let savedLocations = Storage.get('saved-locations') || [];
let unitSystem = Storage.get('weather-units') || 'metric'; // metric or imperial

// Popular cities for suggestions
const popularCities = [
    'New York', 'London', 'Tokyo', 'Paris', 'Sydney',
    'Berlin', 'Moscow', 'Beijing', 'Dubai', 'Singapore',
    'Miami', 'Los Angeles', 'Chicago', 'Toronto', 'Mexico City',
    'São Paulo', 'Buenos Aires', 'Cairo', 'Nairobi', 'Mumbai'
];

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    loadPopularCitiesSuggestions();
    loadSavedLocations();
    loadWeatherData(currentLocation);
    setupEventListeners();
});

// Load popular cities as suggestions
function loadPopularCitiesSuggestions() {
    const suggestionsHTML = popularCities.map(city => 
        `<option value="${city}">`
    ).join('');
    suggestionsList.innerHTML = suggestionsHTML;
}

// Load saved locations from localStorage
function loadSavedLocations() {
    savedLocations = Storage.get('saved-locations') || [];
    
    if (savedLocations.length === 0) {
        savedLocationsGrid.style.display = 'none';
        noLocationsMessage.style.display = 'block';
        return;
    }
    
    savedLocationsGrid.style.display = 'grid';
    noLocationsMessage.style.display = 'none';
    
    // Load weather for each saved location
    savedLocations.forEach(location => {
        loadLocationWeather(location);
    });
}

// Load weather data for a specific location
async function loadWeatherData(location) {
    try {
        weatherLoading.style.display = 'flex';
        
        // Fetch current weather
        const currentWeatherResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&units=${unitSystem}&appid=${WEATHER_API_KEY}`
        );
        
        if (!currentWeatherResponse.ok) {
            throw new Error(`Weather API error: ${currentWeatherResponse.status}`);
        }
        
        const currentWeatherData = await currentWeatherResponse.json();
        
        // Fetch 5-day forecast
        const forecastResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(location)}&units=${unitSystem}&appid=${WEATHER_API_KEY}`
        );
        
        const forecastData = await forecastResponse.json();
        
        // Update display
        updateLocationDisplay(currentWeatherData);
        displayCurrentWeather(currentWeatherData);
        displayWeatherDetails(currentWeatherData);
        displayForecast(forecastData);
        
        // Save as current location
        Storage.set('weather-location', location);
        currentLocation = location;
        
    } catch (error) {
        console.error('Error loading weather data:', error);
        displayErrorMessage('current-weather-card', 'Unable to load weather data. Please try a different location.');
    } finally {
        weatherLoading.style.display = 'none';
    }
}

// Update location display
function updateLocationDisplay(weatherData) {
    const city = weatherData.name;
    const country = weatherData.sys.country;
    locationNameDisplay.textContent = `${city}, ${country}`;
}

// Display current weather
function displayCurrentWeather(weatherData) {
    const temp = Math.round(weatherData.main.temp);
    const feelsLike = Math.round(weatherData.main.feels_like);
    const description = weatherData.weather[0].description;
    const icon = weatherData.weather[0].icon;
    const humidity = weatherData.main.humidity;
    const windSpeed = weatherData.wind.speed;
    const windDirection = getWindDirection(weatherData.wind.deg);
    const pressure = weatherData.main.pressure;
    
    const unitSymbol = unitSystem === 'metric' ? '°C' : '°F';
    const windUnit = unitSystem === 'metric' ? 'm/s' : 'mph';
    
    currentWeatherCard.innerHTML = `
        <div class="weather-main">
            <div class="weather-temp-large">${temp}${unitSymbol}</div>
            <div class="weather-description">${capitalizeWords(description)}</div>
            <div class="weather-location">${weatherData.name}, ${weatherData.sys.country}</div>
            <div class="weather-feels-like">Feels like: ${feelsLike}${unitSymbol}</div>
        </div>
        <div class="weather-icon-large">
            <img src="https://openweathermap.org/img/wn/${icon}@4x.png" alt="${description}">
        </div>
    `;
}

// Display weather details
function displayWeatherDetails(weatherData) {
    const humidity = weatherData.main.humidity;
    const windSpeed = weatherData.wind.speed;
    const pressure = weatherData.main.pressure;
    const visibility = weatherData.visibility;
    const sunrise = new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    const sunset = new Date(weatherData.sys.sunset * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    const windUnit = unitSystem === 'metric' ? 'm/s' : 'mph';
    const visibilityUnit = unitSystem === 'metric' ? 'km' : 'miles';
    const visibilityValue = unitSystem === 'metric' 
        ? (visibility / 1000).toFixed(1) 
        : (visibility / 1609).toFixed(1);
    
    weatherDetails.innerHTML = `
        <div class="weather-detail-card">
            <i class="fas fa-tint"></i>
            <h4>Humidity</h4>
            <div class="weather-detail-value">${humidity}%</div>
        </div>
        <div class="weather-detail-card">
            <i class="fas fa-wind"></i>
            <h4>Wind Speed</h4>
            <div class="weather-detail-value">${windSpeed} ${windUnit}</div>
        </div>
        <div class="weather-detail-card">
            <i class="fas fa-tachometer-alt"></i>
            <h4>Pressure</h4>
            <div class="weather-detail-value">${pressure} hPa</div>
        </div>
        <div class="weather-detail-card">
            <i class="fas fa-eye"></i>
            <h4>Visibility</h4>
            <div class="weather-detail-value">${visibilityValue} ${visibilityUnit}</div>
        </div>
        <div class="weather-detail-card">
            <i class="fas fa-sun"></i>
            <h4>Sunrise</h4>
            <div class="weather-detail-value">${sunrise}</div>
        </div>
        <div class="weather-detail-card">
            <i class="fas fa-moon"></i>
            <h4>Sunset</h4>
            <div class="weather-detail-value">${sunset}</div>
        </div>
    `;
}

// Display 5-day forecast
function displayForecast(forecastData) {
    // Group forecast by day
    const dailyForecast = {};
    
    forecastData.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const day = date.toLocaleDateString('en-US', { weekday: 'short' });
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        if (!dailyForecast[dateStr]) {
            dailyForecast[dateStr] = {
                day,
                date: dateStr,
                temps: [],
                icons: [],
                descriptions: []
            };
        }
        
        dailyForecast[dateStr].temps.push(item.main.temp);
        dailyForecast[dateStr].icons.push(item.weather[0].icon);
        dailyForecast[dateStr].descriptions.push(item.weather[0].description);
    });
    
    // Get next 5 days
    const forecastDays = Object.values(dailyForecast).slice(0, 5);
    const unitSymbol = unitSystem === 'metric' ? '°C' : '°F';
    
    const forecastHTML = forecastDays.map(day => {
        const avgTemp = Math.round(day.temps.reduce((a, b) => a + b, 0) / day.temps.length);
        const maxTemp = Math.round(Math.max(...day.temps));
        const minTemp = Math.round(Math.min(...day.temps));
        const mostCommonIcon = getMostCommonElement(day.icons);
        const mostCommonDescription = getMostCommonElement(day.descriptions);
        
        return `
            <div class="forecast-card">
                <div class="forecast-day">${day.day}</div>
                <div class="forecast-date">${day.date}</div>
                <div class="forecast-icon">
                    <img src="https://openweathermap.org/img/wn/${mostCommonIcon}@2x.png" 
                         alt="${mostCommonDescription}">
                </div>
                <div class="forecast-description">${capitalizeWords(mostCommonDescription)}</div>
                <div class="forecast-temp">
                    <span class="temp-high">${maxTemp}${unitSymbol}</span>
                    <span class="temp-low">${minTemp}${unitSymbol}</span>
                </div>
            </div>
        `;
    }).join('');
    
    forecastContainer.innerHTML = forecastHTML;
}

// Load weather for a saved location
async function loadLocationWeather(location) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location.name)}&units=${unitSystem}&appid=${WEATHER_API_KEY}`
        );
        
        if (response.ok) {
            const data = await response.json();
            updateLocationCard(location, data);
        }
    } catch (error) {
        console.error('Error loading location weather:', error);
    }
}

// Update location card in saved locations
function updateLocationCard(location, weatherData) {
    const temp = Math.round(weatherData.main.temp);
    const description = weatherData.weather[0].description;
    const icon = weatherData.weather[0].icon;
    const unitSymbol = unitSystem === 'metric' ? '°C' : '°F';
    
    const locationCard = document.querySelector(`[data-location="${location.name}"]`);
    
    if (!locationCard) {
        // Create new card
        const cardHTML = `
            <div class="location-card" data-location="${location.name}">
                <div class="location-header">
                    <div>
                        <span class="location-name">${location.name}</span>
                        ${location.label ? `<span class="location-label">${location.label}</span>` : ''}
                    </div>
                    <button class="btn-remove-location" data-location="${location.name}">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="location-weather">
                    <div class="location-temp">${temp}${unitSymbol}</div>
                    <div class="location-info">
                        <div class="location-condition">${capitalizeWords(description)}</div>
                        <div class="location-updated">Just now</div>
                    </div>
                    <img src="https://openweathermap.org/img/wn/${icon}.png" 
                         alt="${description}"
                         class="location-icon">
                </div>
            </div>
        `;
        
        savedLocationsGrid.insertAdjacentHTML('beforeend', cardHTML);
        
        // Add event listener to remove button
        const newCard = savedLocationsGrid.lastElementChild;
        const removeBtn = newCard.querySelector('.btn-remove-location');
        removeBtn.addEventListener('click', () => removeLocation(location.name));
        
        // Add click handler to switch to this location
        newCard.addEventListener('click', (e) => {
            if (!e.target.closest('.btn-remove-location')) {
                loadWeatherData(location.name);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    } else {
        // Update existing card
        const tempElement = locationCard.querySelector('.location-temp');
        const conditionElement = locationCard.querySelector('.location-condition');
        const iconElement = locationCard.querySelector('.location-icon');
        const updatedElement = locationCard.querySelector('.location-updated');
        
        if (tempElement) tempElement.textContent = `${temp}${unitSymbol}`;
        if (conditionElement) conditionElement.textContent = capitalizeWords(description);
        if (iconElement) {
            iconElement.src = `https://openweathermap.org/img/wn/${icon}.png`;
            iconElement.alt = description;
        }
        if (updatedElement) updatedElement.textContent = 'Just now';
    }
}

// Remove a saved location
function removeLocation(locationName) {
    savedLocations = savedLocations.filter(loc => loc.name !== locationName);
    Storage.set('saved-locations', savedLocations);
    
    // Remove card from DOM
    const card = document.querySelector(`[data-location="${locationName}"]`);
    if (card) card.remove();
    
    // Show no locations message if empty
    if (savedLocations.length === 0) {
        savedLocationsGrid.style.display = 'none';
        noLocationsMessage.style.display = 'block';
    }
}

// Get user's current location
function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                
                try {
                    // Reverse geocode to get city name
                    const response = await fetch(
                        `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${WEATHER_API_KEY}`
                    );
                    
                    if (response.ok) {
                        const data = await response.json();
                        if (data[0]) {
                            const city = data[0].name;
                            loadWeatherData(city);
                        }
                    }
                } catch (error) {
                    console.error('Error getting location name:', error);
                    loadWeatherData(`${lat},${lon}`);
                }
            },
            (error) => {
                console.error('Geolocation error:', error);
                alert('Unable to get your location. Please enable location services.');
            }
        );
    } else {
        alert('Geolocation is not supported by your browser.');
    }
}

// Setup event listeners
function setupEventListeners() {
    // Location search
    const debouncedSearch = debounce((query) => {
        if (query.trim().length >= 2) {
            loadWeatherData(query);
        }
    }, 1000);
    
    locationSearchInput.addEventListener('input', (e) => {
        debouncedSearch(e.target.value);
    });
    
    locationSearchBtn.addEventListener('click', () => {
        if (locationSearchInput.value.trim()) {
            loadWeatherData(locationSearchInput.value.trim());
        }
    });
    
    // Use current location
    useLocationBtn.addEventListener('click', getUserLocation);
    
    // Add location modal
    addLocationBtn.addEventListener('click', () => {
        if (addLocationModal) {
            addLocationModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    });
    
    // Location form submission
    if (locationForm) {
        locationForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const locationInput = document.getElementById('new-location');
            const labelInput = document.getElementById('location-label');
            
            const locationName = locationInput.value.trim();
            const locationLabel = labelInput.value.trim();
            
            if (locationName) {
                // Check if already saved
                const isAlreadySaved = savedLocations.some(loc => loc.name === locationName);
                if (!isAlreadySaved) {
                    const newLocation = {
                        name: locationName,
                        label: locationLabel || null,
                        addedAt: new Date().toISOString()
                    };
                    
                    savedLocations.push(newLocation);
                    Storage.set('saved-locations', savedLocations);
                    
                    // Load and display weather for new location
                    loadLocationWeather(newLocation);
                    
                    // Hide no locations message
                    noLocationsMessage.style.display = 'none';
                    savedLocationsGrid.style.display = 'grid';
                    
                    // Reset form and close modal
                    locationForm.reset();
                    addLocationModal.style.display = 'none';
                    document.body.style.overflow = '';
                    
                    showNotification('Location added successfully!');
                } else {
                    alert('This location is already saved.');
                }
            }
        });
    }
    
    // Map view buttons
    document.querySelectorAll('.btn-view-map').forEach(button => {
        button.addEventListener('click', (e) => {
            const mapType = e.target.dataset.map;
            openMapModal(mapType);
        });
    });
    
    // Unit system toggle (optional - you could add this as a button)
    // document.getElementById('unit-toggle').addEventListener('click', toggleUnitSystem);
}

// Open map modal
function openMapModal(mapType) {
    const mapModal = document.getElementById('map-modal');
    const mapTitle = document.getElementById('map-modal-title');
    const mapContainer = document.getElementById('full-map-container');
    
    if (!mapModal) return;
    
    mapTitle.textContent = mapType === 'temperature' ? 'Temperature Map' : 'Precipitation Map';
    
    // In a real implementation, you would embed an actual map here
    // For now, we'll show a placeholder with OpenWeatherMap map URL
    const mapUrl = mapType === 'temperature' 
        ? 'https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid={API_KEY}'
        : 'https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid={API_KEY}';
    
    mapContainer.innerHTML = `
        <div class="map-placeholder-full">
            <img src="images/weather/${mapType}-map-full.jpg" 
                 alt="${mapType} map" 
                 style="width: 100%; height: 100%; object-fit: cover;">
            <div class="map-info">
                <p>Interactive ${mapType} map would be displayed here</p>
                <small>Powered by OpenWeatherMap</small>
            </div>
        </div>
    `;
    
    mapModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Close modal handlers
    const closeButton = mapModal.querySelector('.modal-close');
    closeButton.addEventListener('click', () => {
        mapModal.style.display = 'none';
        document.body.style.overflow = '';
    });
    
    mapModal.addEventListener('click', (e) => {
        if (e.target === mapModal) {
            mapModal.style.display = 'none';
            document.body.style.overflow = '';
        }
    });
}

// Helper functions
function capitalizeWords(str) {
    return str.replace(/\b\w/g, char => char.toUpperCase());
}

function getWindDirection(degrees) {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
}

function getMostCommonElement(arr) {
    const counts = {};
    arr.forEach(item => {
        counts[item] = (counts[item] || 0) + 1;
    });
    
    let maxCount = 0;
    let mostCommon = arr[0];
    
    for (const [item, count] of Object.entries(counts)) {
        if (count > maxCount) {
            maxCount = count;
            mostCommon = item;
        }
    }
    
    return mostCommon;
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Export for testing
export {
    loadWeatherData,
    getUserLocation,
    loadSavedLocations,
    removeLocation,
    capitalizeWords,
    getWindDirection
};