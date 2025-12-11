import { 
    LoadingSpinner, 
    Storage, 
    FormValidator, 
    debounce,
    formatDate,
    capitalizeFirstLetter,
    displayErrorMessage,
    initializeCommon 
} from './main.js';

const NEWS_API_KEY = 'fa6a29ed86a447fe9b1f7e126df60078'; 
const WEATHER_API_KEY = 'cd2d094e1adbb9c4c2055c1f34b4a2e1'; 

initializeCommon();

const DEFAULT_CITY = Storage.get('weather-location') || 'Caracas';
const breakingNewsContainer = document.getElementById('breaking-news-container');
const currentWeatherContainer = document.getElementById('current-weather');
const topStoriesContainer = document.getElementById('top-stories');
const globalSearchInput = document.getElementById('global-search');
const searchButton = document.getElementById('search-btn');
const newsletterForm = document.getElementById('newsletter-form');

// Fetch breaking news from NewsAPI
async function fetchBreakingNews() {
    try {
        LoadingSpinner.show('breaking-news-container');
        
        const cachedNews = Storage.get('breaking-news');
        const lastFetchTime = Storage.get('news-last-fetch');
        const now = Date.now();
        
        // Use cache if less than 5 minutes old
        if (cachedNews && lastFetchTime && (now - lastFetchTime < 5 * 60 * 1000)) {
            displayBreakingNews(cachedNews);
            LoadingSpinner.hide('breaking-news-container');
            return;
        }
        
        const response = await fetch(
            `https://newsapi.org/v2/top-headlines?country=us&pageSize=8&apiKey=${NEWS_API_KEY}`
        );
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.articles && data.articles.length > 0) {
            const filteredArticles = data.articles.filter(article => article.title !== '[Removed]');
            Storage.set('breaking-news', filteredArticles);
            Storage.set('news-last-fetch', now);
            displayBreakingNews(filteredArticles);
        } else {
            throw new Error('No articles found');
        }
    } catch (error) {
        console.error('Error fetching breaking news:', error);
        displayErrorMessage('breaking-news-container', 'Unable to load breaking news. Please try again later.');
    } finally {
        LoadingSpinner.hide('breaking-news-container');
    }
}

// Display breaking news articles
function displayBreakingNews(articles) {
    if (!articles || articles.length === 0) {
        breakingNewsContainer.innerHTML = '<p class="no-news">No breaking news available at the moment.</p>';
        return;
    }
    
    const newsHTML = articles.slice(0, 4).map((article, index) => `
        <div class="breaking-news-item">
            <h3>${article.title}</h3>
            <p>${article.description || 'No description available'}</p>
            <div class="news-meta">
                <span><i class="fas fa-newspaper"></i> ${article.source.name || 'Unknown source'}</span>
                <span><i class="fas fa-clock"></i> ${formatDate(article.publishedAt)}</span>
            </div>
            <button class="read-more-btn" data-index="${index}">Read More</button>
        </div>
    `).join('');
    
    breakingNewsContainer.innerHTML = newsHTML;
    
    // Add event listeners to read more buttons
    document.querySelectorAll('.read-more-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const index = e.target.dataset.index;
            openArticleModal(articles[index]);
        });
    });
}

// Fetch current weather from OpenWeatherMap
async function fetchCurrentWeather() {
    try {
        LoadingSpinner.show('current-weather');
        
        const cachedWeather = Storage.get('current-weather');
        const lastFetchTime = Storage.get('weather-last-fetch');
        const now = Date.now();
        
        // Use cache if less than 10 minutes old
        if (cachedWeather && lastFetchTime && (now - lastFetchTime < 10 * 60 * 1000)) {
            displayCurrentWeather(cachedWeather);
            LoadingSpinner.hide('current-weather');
            return;
        }
        
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${DEFAULT_CITY}&units=metric&appid=${WEATHER_API_KEY}`
        );
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        Storage.set('current-weather', data);
        Storage.set('weather-last-fetch', now);
        displayCurrentWeather(data);
    } catch (error) {
        console.error('Error fetching weather:', error);
        displayErrorMessage('current-weather', 'Unable to load weather data. Please try again later.');
    } finally {
        LoadingSpinner.hide('current-weather');
    }
}

// Display current weather
function displayCurrentWeather(weatherData) {
    const temperature = Math.round(weatherData.main.temp);
    const feelsLike = Math.round(weatherData.main.feels_like);
    const description = weatherData.weather[0].description;
    const icon = weatherData.weather[0].icon;
    const humidity = weatherData.main.humidity;
    const windSpeed = weatherData.wind.speed;
    
    const weatherHTML = `
        <div class="current-weather-info">
            <div class="weather-icon">
                <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}">
            </div>
            <div class="weather-main">
                <div class="weather-temp">${temperature}°C</div>
                <div class="weather-desc">${capitalizeFirstLetter(description)}</div>
                <div class="weather-location">${DEFAULT_CITY}</div>
            </div>
        </div>
        <div class="weather-details-grid">
            <div class="weather-detail">
                <i class="fas fa-temperature-low"></i>
                <span>Feels like: ${feelsLike}°C</span>
            </div>
            <div class="weather-detail">
                <i class="fas fa-tint"></i>
                <span>Humidity: ${humidity}%</span>
            </div>
            <div class="weather-detail">
                <i class="fas fa-wind"></i>
                <span>Wind: ${windSpeed} m/s</span>
            </div>
        </div>
    `;
    
    currentWeatherContainer.innerHTML = weatherHTML;
}

// Fetch top stories from NewsAPI
async function fetchTopStories() {
    try {
        LoadingSpinner.show('top-stories');
        
        const cachedStories = Storage.get('top-stories');
        const lastFetchTime = Storage.get('stories-last-fetch');
        const now = Date.now();
        
        // Use cache if less than 5 minutes old
        if (cachedStories && lastFetchTime && (now - lastFetchTime < 5 * 60 * 1000)) {
            displayTopStories(cachedStories);
            LoadingSpinner.hide('top-stories');
            return;
        }
        
        const response = await fetch(
            `https://newsapi.org/v2/top-headlines?country=us&pageSize=12&apiKey=${NEWS_API_KEY}`
        );
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.articles && data.articles.length > 0) {
            const filteredStories = data.articles.filter(article => article.title !== '[Removed]');
            Storage.set('top-stories', filteredStories);
            Storage.set('stories-last-fetch', now);
            displayTopStories(filteredStories);
        } else {
            throw new Error('No stories found');
        }
    } catch (error) {
        console.error('Error fetching top stories:', error);
        displayErrorMessage('top-stories', 'Unable to load top stories. Please try again later.');
    } finally {
        LoadingSpinner.hide('top-stories');
    }
}

// Display top stories
function displayTopStories(stories) {
    if (!stories || stories.length === 0) {
        topStoriesContainer.innerHTML = '<p class="no-stories">No top stories available at the moment.</p>';
        return;
    }
    
    const storiesHTML = stories.slice(0, 12).map((story, index) => `
        <article class="story-card">
            <img src="${story.urlToImage || 'images/news-placeholder.jpg'}" 
                 alt="${story.title}" 
                 loading="lazy">
            <div class="story-content">
                <h3>${story.title}</h3>
                <div class="story-meta">
                    <span><i class="fas fa-newspaper"></i> ${story.source.name || 'Unknown'}</span>
                    <span><i class="fas fa-clock"></i> ${formatDate(story.publishedAt)}</span>
                </div>
                <p>${story.description || 'No description available.'}</p>
                <a href="${story.url}" target="_blank" rel="noopener" class="story-link">Read Full Article</a>
            </div>
        </article>
    `).join('');
    
    topStoriesContainer.innerHTML = storiesHTML;
}

// Open article modal
function openArticleModal(article) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'article-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${article.title}</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <img src="${article.urlToImage || 'images/news-placeholder.jpg'}" 
                     alt="${article.title}" 
                     class="modal-image">
                <div class="article-meta">
                    <span><i class="fas fa-newspaper"></i> ${article.source.name || 'Unknown source'}</span>
                    <span><i class="fas fa-user"></i> ${article.author || 'Unknown author'}</span>
                    <span><i class="fas fa-clock"></i> ${formatDate(article.publishedAt)}</span>
                </div>
                <div class="article-content">
                    <p>${article.content || article.description || 'Content not available.'}</p>
                </div>
                <a href="${article.url}" target="_blank" rel="noopener" class="btn-external">
                    Read on original site <i class="fas fa-external-link-alt"></i>
                </a>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Add event listener to close button
    const closeButton = modal.querySelector('.modal-close');
    closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
        document.body.style.overflow = '';
        modal.remove();
    });
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
            modal.remove();
        }
    });
    
    // Close modal on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            modal.style.display = 'none';
            document.body.style.overflow = '';
            modal.remove();
        }
    });
}

// Global search functionality
function setupGlobalSearch() {
    let isSearching = false;
    
    const debouncedSearch = debounce(async (query) => {
        if (query.length < 3) {
            // Hide results if query is too short
            const resultsDropdown = document.querySelector('.search-results-dropdown');
            if (resultsDropdown) {
                resultsDropdown.style.display = 'none';
            }
            return;
        }
        
        try {
            isSearching = true;
            // Show loading state
            const resultsDropdown = document.querySelector('.search-results-dropdown');
            if (resultsDropdown) {
                resultsDropdown.innerHTML = `
                    <div style="padding: 2rem; text-align: center;">
                        <div class="spinner" style="margin: 0 auto 1rem;"></div>
                        <p>Searching for "${query}"...</p>
                    </div>
                `;
                resultsDropdown.style.display = 'block';
            }
            
            const response = await fetch(
                `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&pageSize=6&apiKey=${NEWS_API_KEY}`
            );
            
            if (response.ok) {
                const data = await response.json();
                displaySearchResults(data.articles);
            } else {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error) {
            console.error('Search error:', error);
            const resultsDropdown = document.querySelector('.search-results-dropdown');
            if (resultsDropdown) {
                resultsDropdown.innerHTML = `
                    <div class="no-results">
                        <i class="fas fa-exclamation-triangle" style="color: var(--error-red); margin-bottom: 1rem;"></i>
                        <p>Search failed. Please try again.</p>
                    </div>
                `;
                resultsDropdown.style.display = 'block';
            }
        } finally {
            isSearching = false;
        }
    }, 500);
    
    globalSearchInput.addEventListener('input', (e) => {
        debouncedSearch(e.target.value);
    });
    
    searchButton.addEventListener('click', () => {
        if (globalSearchInput.value.length >= 3 && !isSearching) {
            debouncedSearch(globalSearchInput.value);
        }
    });
    
    // Clear search on page refresh
    globalSearchInput.value = '';
}

// Truncate text utility
function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength).trim() + '...';
}

// Display search results
function displaySearchResults(articles) {
    // Create or update search results dropdown
    let resultsDropdown = document.querySelector('.search-results-dropdown');
    if (!resultsDropdown) {
        resultsDropdown = document.createElement('div');
        resultsDropdown.className = 'search-results-dropdown';
        const searchContainer = globalSearchInput.parentNode;
        searchContainer.classList.add('has-search-dropdown');
        searchContainer.appendChild(resultsDropdown);
    }
    
    // Clear previous results
    resultsDropdown.innerHTML = '';
    
    if (!articles || articles.length === 0) {
        resultsDropdown.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 1rem; color: var(--text-secondary);"></i>
                <p>No results found for "${globalSearchInput.value}"</p>
                <p style="font-size: 0.875rem; margin-top: 0.5rem;">Try different keywords</p>
            </div>
        `;
        resultsDropdown.style.display = 'block';
        return;
    }
    
    // Limit to 6 results for better UX
    const limitedArticles = articles.slice(0, 6);
    
    const resultsHTML = limitedArticles.map(article => `
        <div class="search-result-item" data-url="${article.url}">
            <h4>${article.title}</h4>
            <p>${article.source?.name || 'Unknown source'} • ${formatDate(article.publishedAt)}</p>
            <p style="font-size: 0.875rem; color: var(--text-secondary); margin-top: 0.5rem;">
                ${article.description ? truncateText(article.description, 100) : 'No description available'}
            </p>
            <a href="${article.url}" target="_blank" rel="noopener" class="read-article-link">
                Read full article <i class="fas fa-external-link-alt"></i>
            </a>
        </div>
    `).join('');
    
    resultsDropdown.innerHTML = resultsHTML;
    resultsDropdown.style.display = 'block';
    
    // Add click handler to each result item
    document.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', (e) => {
            // Don't trigger if clicking on the link itself
            if (!e.target.closest('a')) {
                const url = item.dataset.url;
                if (url) {
                    window.open(url, '_blank', 'noopener');
                }
            }
        });
    });
    
    // Hide dropdown when clicking outside
    document.addEventListener('click', (e) => {
        const isSearchInput = e.target === globalSearchInput;
        const isSearchButton = e.target === searchButton;
        const isInResults = resultsDropdown.contains(e.target);
        
        if (!isSearchInput && !isSearchButton && !isInResults) {
            resultsDropdown.style.display = 'none';
        }
    });
    
    // Hide dropdown on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            resultsDropdown.style.display = 'none';
        }
    });
}

// Newsletter form handling
function setupNewsletterForm() {
    if (!newsletterForm) return;
    
    newsletterForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const emailInput = newsletterForm.querySelector('#email');
        const email = emailInput.value.trim();
        
        // Validate email
        if (!FormValidator.validateEmail(email)) {
            FormValidator.showError(emailInput, 'Please enter a valid email address');
            return;
        }
        
        FormValidator.clearError(emailInput);
        
        // Get form data
        const formData = new FormData(newsletterForm);
        const categories = formData.getAll('categories');
        const includeWeatherAlerts = formData.get('weather-alerts') === 'on';
        
        // Save to localStorage
        const preferences = {
            email,
            categories,
            includeWeatherAlerts,
            subscribedAt: new Date().toISOString()
        };
        
        Storage.set('newsletter-preferences', preferences);
        
        // Show success message
        alert('Thank you for subscribing! You will receive our newsletter soon.');
        newsletterForm.reset();
    });
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Fetch and display data
    fetchBreakingNews();
    fetchCurrentWeather();
    fetchTopStories();
    
    // Setup event listeners
    setupGlobalSearch();
    setupNewsletterForm();
    
    // Setup refresh buttons
    document.querySelectorAll('.refresh-btn').forEach(button => {
        button.addEventListener('click', () => {
            if (button.dataset.type === 'news') {
                fetchBreakingNews();
            } else if (button.dataset.type === 'weather') {
                fetchCurrentWeather();
            }
        });
    });
});

// Export for testing
export {
    fetchBreakingNews,
    fetchCurrentWeather,
    fetchTopStories,
    displayBreakingNews,
    displayCurrentWeather,
    displayTopStories
};