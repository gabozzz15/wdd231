const myKey = 'cd2d094e1adbb9c4c2055c1f34b4a2e1';
const myLat = '49.75';
const myLon = '6.63';

const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${myLat}&lon=${myLon}&appid=${myKey}&units=imperial`;
const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${myLat}&lon=${myLon}&appid=${myKey}&units=imperial`;

const currentTemp = document.querySelector('#current-temp');
const weatherIcon = document.querySelector('#weather-icon');
const weatherDescription = document.querySelector('#weather-description');
const forecastContainer = document.querySelector('#forecast-container');
const spotlightContainer = document.querySelector('#spotlight-container');

async function fetchCurrentWeather() {
    try {
        const response = await fetch(currentWeatherUrl);
        if (response.ok) {
            const data = await response.json();
            displayCurrentWeather(data);
        } else {
            throw Error(await response.text());
        }
    } catch (error) {
        console.log('Error fetching current weather:', error);
        currentTemp.textContent = 'Weather data unavailable';
    }
}

async function fetchForecast() {
    try {
        const response = await fetch(forecastUrl);
        if (response.ok) {
            const data = await response.json();
            displayForecast(data);
        } else {
            throw Error(await response.text());
        }
    } catch (error) {
        console.log('Error fetching forecast:', error);
        forecastContainer.innerHTML = '<p>Forecast unavailable</p>';
    }
}

function displayCurrentWeather(data) {
    currentTemp.innerHTML = `${Math.round(data.main.temp)}&deg;F`;
    
    const iconsrc = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    const desc = data.weather[0].description;
    
    weatherIcon.setAttribute('src', iconsrc);
    weatherIcon.setAttribute('alt', desc);
    weatherDescription.textContent = desc;
}

function displayForecast(data) {
    const dailyForecasts = data.list.filter(item => 
        item.dt_txt.includes('12:00:00')
    ).slice(0, 3); // Get first 3 days
    
    forecastContainer.innerHTML = '';
    
    dailyForecasts.forEach(day => {
        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString('en', { weekday: 'short' });
        
        const forecastDay = document.createElement('div');
        forecastDay.className = 'forecast-day';
        
        forecastDay.innerHTML = `
            <h4>${dayName}</h4>
            <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="${day.weather[0].description}">
            <div class="forecast-temp">${Math.round(day.main.temp)}&deg;F</div>
            <p>${day.weather[0].description}</p>
        `;
        
        forecastContainer.appendChild(forecastDay);
    });
}

// Helper function to get membership level name
function getMembershipLevel(level) {
    switch(level) {
        case 3: return 'Gold';
        case 2: return 'Silver';
        case 1: return 'Bronze';
        default: return 'Member';
    }
}

async function loadSpotlightMembers() {
    try {
        const response = await fetch('data/members.json');
        if (response.ok) {
            const members = await response.json();
            displaySpotlightMembers(members);
        } else {
            throw Error(await response.text());
        }
    } catch (error) {
        console.log('Error loading members:', error);
        spotlightContainer.innerHTML = '<p>Member information unavailable</p>';
    }
}

// Display spotlight members (gold and silver only, random selection)
function displaySpotlightMembers(members) {
    const spotlightMembers = members.filter(member => 
        member.membership === 3 || member.membership === 2
    );
    const selectedMembers = [];
    const numToShow = Math.min(Math.floor(Math.random() * 2) + 2, spotlightMembers.length);
    
    // Create a copy to avoid modifying the original array
    const availableMembers = [...spotlightMembers];
    
    for (let i = 0; i < numToShow; i++) {
        if (availableMembers.length === 0) break;
        
        const randomIndex = Math.floor(Math.random() * availableMembers.length);
        selectedMembers.push(availableMembers[randomIndex]);
        availableMembers.splice(randomIndex, 1);
    }
    
    // Display selected members
    spotlightContainer.innerHTML = '';
    
    selectedMembers.forEach(member => {
        const card = document.createElement('div');
        card.className = 'spotlight-card';
        
        const membershipName = getMembershipLevel(member.membership);
        const levelClass = membershipName.toLowerCase();
        
        card.innerHTML = `
            <img src="images/${member.image}" alt="${member.name} logo" loading="lazy">
            <h3>${member.name}</h3>
            <span class="spotlight-level ${levelClass}">${membershipName} Member</span>
            <p>${member.address}</p>
            <p>Phone: ${member.phone}</p>
            <a href="${member.website}" target="_blank" rel="noopener">Visit Website</a>
        `;
        
        spotlightContainer.appendChild(card);
    });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    fetchCurrentWeather();
    fetchForecast();
    loadSpotlightMembers();
    
    document.getElementById('copyright').textContent = `© ${new Date().getFullYear()} Venezuelan Chamber of Commerce`;
    document.getElementById('lastModified').textContent = `Last Modified: ${document.lastModified}`;
    
    const hamburger = document.querySelector('.hamburger');
    const primaryNav = document.querySelector('.primary-nav');
    
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        primaryNav.classList.toggle('is-open');
    });
});