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

// API Configuration
const NEWS_API_KEY = 'fa6a29ed86a447fe9b1f7e126df60078'; 

// Initialize common functionality
initializeCommon();

// DOM Elements
const newsGridContainer = document.getElementById('news-grid-container');
const newsLoading = document.getElementById('news-loading');
const loadMoreContainer = document.getElementById('load-more-container');
const loadMoreBtn = document.getElementById('load-more-btn');
const noResultsMessage = document.getElementById('no-results-message');
const categoryButtons = document.querySelectorAll('.category-btn');
const categorySelect = document.getElementById('category-select');
const sortSelect = document.getElementById('sort-select');
const newsSearchInput = document.getElementById('news-search-input');
const newsSearchBtn = document.getElementById('news-search-btn');
const sourcesGrid = document.querySelector('.sources-grid');
const preferencesModal = document.getElementById('preferences-modal');
const preferencesForm = document.getElementById('preferences-form');

// State variables
let currentPage = 1;
let currentCategory = 'all';
let currentSearchQuery = '';
let currentSortBy = 'publishedAt';
let allArticles = [];
let filteredArticles = [];
const articlesPerPage = 12;

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    loadUserPreferences();
    loadNewsSources();
    loadArticles();
    setupEventListeners();
});

// Load user preferences from localStorage
function loadUserPreferences() {
    const preferences = Storage.get('news-preferences') || {};
    
    // Set category from preferences or default
    if (preferences.defaultCategory) {
        currentCategory = preferences.defaultCategory;
        categorySelect.value = currentCategory;
        
        // Activate corresponding category button
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.category === currentCategory) {
                btn.classList.add('active');
            }
        });
    }
    
    // Set sort preference
    if (preferences.sortBy) {
        currentSortBy = preferences.sortBy;
        sortSelect.value = currentSortBy;
    }
}

// Load news sources
function loadNewsSources() {
    const sources = [
        { name: 'BBC News', domain: 'bbc.com', country: 'gb' },
        { name: 'CNN', domain: 'cnn.com', country: 'us' },
        { name: 'Reuters', domain: 'reuters.com', country: 'us' },
        { name: 'Associated Press', domain: 'apnews.com', country: 'us' },
        { name: 'The Guardian', domain: 'theguardian.com', country: 'gb' },
        { name: 'Al Jazeera', domain: 'aljazeera.com', country: 'qa' }
    ];
    
    const sourcesHTML = sources.map(source => `
        <div class="source-card">
            <div class="source-icon">
                <i class="fas fa-newspaper"></i>
            </div>
            <div class="source-info">
                <h4>${source.name}</h4>
                <p>${source.country.toUpperCase()}</p>
            </div>
        </div>
    `).join('');
    
    sourcesGrid.innerHTML = sourcesHTML;
}

// Load articles from API
async function loadArticles() {
    try {
        newsLoading.style.display = 'flex';
        noResultsMessage.style.display = 'none';
        
        let apiUrl;
        
        if (currentSearchQuery) {
            // Search for specific query
            apiUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(currentSearchQuery)}&sortBy=${currentSortBy}&page=${currentPage}&pageSize=${articlesPerPage}&apiKey=${NEWS_API_KEY}`;
        } else if (currentCategory !== 'all') {
            // Get by category
            apiUrl = `https://newsapi.org/v2/top-headlines?category=${currentCategory}&country=us&page=${currentPage}&pageSize=${articlesPerPage}&apiKey=${NEWS_API_KEY}`;
        } else {
            // Get general top headlines
            apiUrl = `https://newsapi.org/v2/top-headlines?country=us&page=${currentPage}&pageSize=${articlesPerPage}&apiKey=${NEWS_API_KEY}`;
        }
        
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.articles && data.articles.length > 0) {
            // Filter out removed articles
            const validArticles = data.articles.filter(article => 
                article.title !== '[Removed]' && article.urlToImage
            );
            
            if (currentPage === 1) {
                allArticles = validArticles;
            } else {
                allArticles = [...allArticles, ...validArticles];
            }
            
            displayArticles();
            
            // Show/hide load more button
            if (validArticles.length === articlesPerPage) {
                loadMoreContainer.style.display = 'block';
            } else {
                loadMoreContainer.style.display = 'none';
            }
        } else {
            if (currentPage === 1) {
                showNoResults();
            } else {
                loadMoreContainer.style.display = 'none';
            }
        }
    } catch (error) {
        console.error('Error loading articles:', error);
        displayErrorMessage('news-grid-container', 'Unable to load news articles. Please try again later.');
    } finally {
        newsLoading.style.display = 'none';
    }
}

// Display articles in grid
function displayArticles() {
    if (currentPage === 1) {
        newsGridContainer.innerHTML = '';
    }
    
    const startIndex = (currentPage - 1) * articlesPerPage;
    const endIndex = startIndex + articlesPerPage;
    const articlesToShow = allArticles.slice(startIndex, endIndex);
    
    if (articlesToShow.length === 0) {
        showNoResults();
        return;
    }
    
    const articlesHTML = articlesToShow.map((article) => `
        <article class="news-card">
            <div class="news-card-image">
                <img src="${article.urlToImage}" 
                     alt="${article.title}" 
                     loading="lazy"
                     onerror="this.src='images/news-placeholder.jpg'">
                <div class="news-category">${article.source.name || 'News'}</div>
            </div>
            <div class="news-card-content">
                <h4 class="news-title">${article.title}</h4>
                <p class="news-description">${article.description || 'No description available.'}</p>
                <div class="news-meta">
                    <span class="news-author">${article.author || 'Unknown Author'}</span>
                    <span class="news-date">${formatDate(article.publishedAt)}</span>
                </div>
                <div class="news-actions">
                    <a href="${article.url}" target="_blank" rel="noopener" class="btn-read">Read Article</a>
                </div>
            </div>
        </article>
    `).join('');
    
    if (currentPage === 1) {
        newsGridContainer.innerHTML = articlesHTML;
    } else {
        newsGridContainer.insertAdjacentHTML('beforeend', articlesHTML);
    }
}

// Show no results message
function showNoResults() {
    newsGridContainer.innerHTML = '';
    noResultsMessage.style.display = 'block';
    loadMoreContainer.style.display = 'none';
}

// Setup event listeners
function setupEventListeners() {
    // Category buttons
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active state
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Update category
            currentCategory = button.dataset.category;
            categorySelect.value = currentCategory;
            
            // Reset and load articles
            resetAndLoadArticles();
        });
    });
    
    // Category select
    categorySelect.addEventListener('change', () => {
        currentCategory = categorySelect.value;
        
        // Update active button
        categoryButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.category === currentCategory) {
                btn.classList.add('active');
            }
        });
        
        resetAndLoadArticles();
    });
    
    // Sort select
    sortSelect.addEventListener('change', () => {
        currentSortBy = sortSelect.value;
        resetAndLoadArticles();
        
        // Save preference
        const preferences = Storage.get('news-preferences') || {};
        preferences.sortBy = currentSortBy;
        Storage.set('news-preferences', preferences);
    });
    
    // Search input with debounce
    const debouncedSearch = debounce((query) => {
        currentSearchQuery = query;
        resetAndLoadArticles();
    }, 500);
    
    newsSearchInput.addEventListener('input', (e) => {
        debouncedSearch(e.target.value);
    });
    
    // Search button
    newsSearchBtn.addEventListener('click', () => {
        currentSearchQuery = newsSearchInput.value;
        resetAndLoadArticles();
    });
    
    // Load more button
    loadMoreBtn.addEventListener('click', () => {
        currentPage++;
        loadArticles();
    });
    
    // Preferences form
    if (preferencesForm) {
        preferencesForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const defaultCategory = document.getElementById('default-category').value;
            const savePreferences = document.getElementById('save-preferences').checked;
            
            if (savePreferences) {
                const preferences = {
                    defaultCategory,
                    sortBy: currentSortBy
                };
                Storage.set('news-preferences', preferences);
            }
            
            // Close modal
            const modal = document.getElementById('preferences-modal');
            if (modal) {
                modal.style.display = 'none';
                document.body.style.overflow = '';
            }
            
            showNotification('Preferences saved!');
        });
    }
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Reset and load articles
function resetAndLoadArticles() {
    currentPage = 1;
    allArticles = [];
    loadArticles();
}

// Export for testing
export {
    loadArticles,
    resetAndLoadArticles
};