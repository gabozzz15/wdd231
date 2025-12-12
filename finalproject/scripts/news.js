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

initializeCommon();

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

let currentPage = 1;
let currentCategory = 'all';
let currentSearchQuery = '';
let currentSortBy = 'publishedAt';
let allArticles = [];
let filteredArticles = [];
const articlesPerPage = 12;

document.addEventListener('DOMContentLoaded', () => {
    loadUserPreferences();
    loadNewsSources();
    loadArticles();
    setupEventListeners();
});

function loadUserPreferences() {
    const preferences = Storage.get('news-preferences') || {};

    if (preferences.defaultCategory) {
        currentCategory = preferences.defaultCategory;
        categorySelect.value = currentCategory;

        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.category === currentCategory) {
                btn.classList.add('active');
            }
        });
    }

    if (preferences.sortBy) {
        currentSortBy = preferences.sortBy;
        sortSelect.value = currentSortBy;
    }
}

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

async function loadArticles() {
    try {
        newsLoading.style.display = 'flex';
        noResultsMessage.style.display = 'none';

        let apiUrl;

        if (currentSearchQuery) {
            apiUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(currentSearchQuery)}&sortBy=${currentSortBy}&page=${currentPage}&pageSize=${articlesPerPage}&apiKey=${NEWS_API_KEY}`;
        } else if (currentCategory !== 'all') {
            apiUrl = `https://newsapi.org/v2/top-headlines?category=${currentCategory}&country=us&page=${currentPage}&pageSize=${articlesPerPage}&apiKey=${NEWS_API_KEY}`;
        } else {
            apiUrl = `https://newsapi.org/v2/top-headlines?country=us&page=${currentPage}&pageSize=${articlesPerPage}&apiKey=${NEWS_API_KEY}`;
        }

        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.articles && data.articles.length > 0) {
            const validArticles = data.articles.filter(article =>
                article.title !== '[Removed]' && article.urlToImage
            );

            if (currentPage === 1) {
                allArticles = validArticles;
            } else {
                allArticles = [...allArticles, ...validArticles];
            }

            displayArticles();

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

    const articlesHTML = articlesToShow.map((article, index) => `
        <article class="news-card" data-index="${startIndex + index}">
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
                    <button class="btn-read" data-url="${article.url}">Read Article</button>
                </div>
            </div>
        </article>
    `).join('');

    if (currentPage === 1) {
        newsGridContainer.innerHTML = articlesHTML;
    } else {
        newsGridContainer.insertAdjacentHTML('beforeend', articlesHTML);
    }

    attachArticleEventListeners();
}

function showNoResults() {
    newsGridContainer.innerHTML = '';
    noResultsMessage.style.display = 'block';
    loadMoreContainer.style.display = 'none';
}

function attachArticleEventListeners() {
    document.querySelectorAll('.btn-read').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const url = e.target.dataset.url;
            if (url) {
                window.open(url, '_blank', 'noopener');
            }
        });
    });
}

function saveArticle(article) {
    const savedArticles = Storage.get('saved-articles') || [];

    const isAlreadySaved = savedArticles.some(saved => saved.url === article.url);
    if (!isAlreadySaved) {
        savedArticles.push({
            ...article,
            savedAt: new Date().toISOString()
        });
        Storage.set('saved-articles', savedArticles);

        showNotification('Article saved to your reading list!');
    }
}

function openArticleModal(article) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'article-detail-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${article.title}</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="article-detail-image">
                    <img src="${article.urlToImage}" 
                         alt="${article.title}"
                         onerror="this.src='images/news-placeholder.jpg'">
                </div>
                <div class="article-detail-meta">
                    <span><i class="fas fa-user"></i> ${article.author || 'Unknown Author'}</span>
                    <span><i class="fas fa-newspaper"></i> ${article.source.name || 'Unknown Source'}</span>
                    <span><i class="fas fa-clock"></i> ${formatDate(article.publishedAt)}</span>
                </div>
                <div class="article-detail-content">
                    <p>${article.content || article.description || 'Content not available.'}</p>
                </div>
                <div class="article-detail-actions">
                    <a href="${article.url}" target="_blank" rel="noopener" class="btn-external">
                        Read on original site <i class="fas fa-external-link-alt"></i>
                    </a>
                    <button class="btn-save-modal" data-article='${JSON.stringify(article)}'>
                        <i class="far fa-bookmark"></i> Save Article
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    const closeButton = modal.querySelector('.modal-close');
    closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
        document.body.style.overflow = '';
        modal.remove();
    });

    const saveButton = modal.querySelector('.btn-save-modal');
    saveButton.addEventListener('click', () => {
        saveArticle(article);
        saveButton.innerHTML = '<i class="fas fa-bookmark"></i> Saved';
        saveButton.disabled = true;
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
            modal.remove();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            modal.style.display = 'none';
            document.body.style.overflow = '';
            modal.remove();
        }
    });
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

function setupEventListeners() {
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            currentCategory = button.dataset.category;
            categorySelect.value = currentCategory;

            resetAndLoadArticles();
        });
    });

    categorySelect.addEventListener('change', () => {
        currentCategory = categorySelect.value;

        categoryButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.category === currentCategory) {
                btn.classList.add('active');
            }
        });

        resetAndLoadArticles();
    });

    sortSelect.addEventListener('change', () => {
        currentSortBy = sortSelect.value;
        resetAndLoadArticles();

        const preferences = Storage.get('news-preferences') || {};
        preferences.sortBy = currentSortBy;
        Storage.set('news-preferences', preferences);
    });

    const debouncedSearch = debounce((query) => {
        currentSearchQuery = query;
        resetAndLoadArticles();
    }, 500);

    newsSearchInput.addEventListener('input', (e) => {
        debouncedSearch(e.target.value);
    });

    newsSearchBtn.addEventListener('click', () => {
        currentSearchQuery = newsSearchInput.value;
        resetAndLoadArticles();
    });

    loadMoreBtn.addEventListener('click', () => {
        currentPage++;
        loadArticles();
    });

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

            const modal = document.getElementById('preferences-modal');
            if (modal) {
                modal.style.display = 'none';
                document.body.style.overflow = '';
            }

            showNotification('Preferences saved!');
        });
    }
}

function resetAndLoadArticles() {
    currentPage = 1;
    allArticles = [];
    loadArticles();
}

export {
    loadArticles,
    saveArticle,
    openArticleModal,
    resetAndLoadArticles
};