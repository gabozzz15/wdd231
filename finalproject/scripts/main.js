export function setupHamburgerMenu() {
    const hamburger = document.querySelector('.hamburger');
    const primaryNav = document.querySelector('.primary-nav');

    if (!hamburger || !primaryNav) return;

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        primaryNav.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
        if (primaryNav.classList.contains('active') &&
            !primaryNav.contains(e.target) &&
            !hamburger.contains(e.target)) {
            hamburger.classList.remove('active');
            primaryNav.classList.remove('active');
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && primaryNav.classList.contains('active')) {
            hamburger.classList.remove('active');
            primaryNav.classList.remove('active');
        }
    });
}

export function updateFooterYear() {
    const currentYearElement = document.getElementById('current-year');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }
}

export function updateLastModified() {
    const lastModifiedElement = document.getElementById('last-modified');
    if (lastModifiedElement) {
        lastModifiedElement.textContent = `Last modified: ${document.lastModified}`;
    }
}

// Modal functionality
export class Modal {
    constructor(modalId) {
        this.modal = document.getElementById(modalId);
        this.closeButtons = this.modal?.querySelectorAll('.modal-close, [data-dismiss="modal"]');
        this.init();
    }

    init() {
        if (!this.modal) return;

        this.closeButtons?.forEach(button => {
            button.addEventListener('click', () => this.close());
        });

        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.style.display === 'block') {
                this.close();
            }
        });
    }

    open() {
        if (this.modal) {
            this.modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    close() {
        if (this.modal) {
            this.modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    }
}

export function initializeModals() {
    const modals = document.querySelectorAll('.modal');
    const modalInstances = {};

    modals.forEach(modal => {
        const modalId = modal.id;
        if (modalId) {
            modalInstances[modalId] = new Modal(modalId);
        }
    });

    return modalInstances;
}

export const LoadingSpinner = {
    show(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <div class="loading-spinner">
                    <div class="spinner"></div>
                    <p>Loading...</p>
                </div>
            `;
        }
    },

    hide(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            const spinner = container.querySelector('.loading-spinner');
            if (spinner) {
                spinner.style.display = 'none';
            }
        }
    },

    showInline(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            const existingSpinner = container.querySelector('.loading-spinner');
            if (!existingSpinner) {
                const spinner = document.createElement('div');
                spinner.className = 'loading-spinner';
                spinner.innerHTML = `
                    <div class="spinner"></div>
                    <p>Loading...</p>
                `;
                container.appendChild(spinner);
            }
        }
    },

    hideInline(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            const spinner = container.querySelector('.loading-spinner');
            if (spinner) {
                spinner.remove();
            }
        }
    }
};

// Local Storage utilities
export const Storage = {
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    },

    get(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return null;
        }
    },

    remove(key) {
        localStorage.removeItem(key);
    },

    clear() {
        localStorage.clear();
    },

    // Specific storage helpers
    getNewsPreferences() {
        return this.get('news-preferences') || { categories: ['general'] };
    },

    setNewsPreferences(preferences) {
        this.set('news-preferences', preferences);
    },

    getWeatherLocation() {
        return this.get('weather-location') || 'Caracas';
    },

    setWeatherLocation(location) {
        this.set('weather-location', location);
    },

    getLastVisit() {
        return this.get('last-visit');
    },

    setLastVisit(timestamp) {
        this.set('last-visit', timestamp);
    }
};

// Form validation helper
export const FormValidator = {
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    validateRequired(fields) {
        return fields.every(field => {
            const value = field.value ? field.value.trim() : '';
            return value !== '';
        });
    },

    showError(field, message) {
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        errorElement.style.color = 'var(--error-red)';
        errorElement.style.fontSize = '0.875rem';
        errorElement.style.marginTop = '0.25rem';

        // Remove existing error
        const existingError = field.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        field.parentNode.appendChild(errorElement);
        field.style.borderColor = 'var(--error-red)';
    },

    clearError(field) {
        const errorElement = field.parentNode.querySelector('.error-message');
        if (errorElement) {
            errorElement.remove();
        }
        field.style.borderColor = '';
    },

    clearAllErrors(form) {
        const errors = form.querySelectorAll('.error-message');
        errors.forEach(error => error.remove());

        const fields = form.querySelectorAll('input, select, textarea');
        fields.forEach(field => {
            field.style.borderColor = '';
        });
    }
};

export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export function throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

export function formatDate(dateString, format = 'relative') {
    const date = new Date(dateString);
    const now = new Date();

    if (format === 'relative') {
        const diffInMs = now - date;
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

        if (diffInMinutes < 1) {
            return 'Just now';
        } else if (diffInMinutes < 60) {
            return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
        } else if (diffInHours < 24) {
            return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
        } else if (diffInDays < 7) {
            return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
        }
    }

    // Default format
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

export function capitalizeFirstLetter(string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
}
export function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
}
export function displayErrorMessage(containerId, message) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="error-message" style="text-align: center; padding: 2rem;">
                <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: var(--error-red); margin-bottom: 1rem;"></i>
                <p>${message}</p>
                <button onclick="location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: var(--secondary-blue); color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Try Again
                </button>
            </div>
        `;
    }
}

export function initializeCommon() {
    setupHamburgerMenu();
    updateFooterYear();
    updateLastModified();
    initializeModals();

    handleLastVisitMessage();
}

// Handle last visit message for discover page
function handleLastVisitMessage() {
    const visitorMessage = document.getElementById('visitor-message');
    if (!visitorMessage) return;

    const lastVisit = Storage.get('last-visit');
    const currentVisit = Date.now();

    let message = '';

    if (!lastVisit) {
        // First visit
        message = 'Welcome! Let us know if you have any questions.';
    } else {
        const lastVisitDate = parseInt(lastVisit);
        const daysBetween = Math.floor((currentVisit - lastVisitDate) / (1000 * 60 * 60 * 24));

        if (daysBetween === 0) {
            message = 'Back so soon! Awesome!';
        } else if (daysBetween === 1) {
            message = `You last visited 1 day ago.`;
        } else {
            message = `You last visited ${daysBetween} days ago.`;
        }
    }

    // Store current visit
    Storage.set('last-visit', currentVisit);

    // Display message
    visitorMessage.innerHTML = `<p>${message}</p>`;
}

export default {
    setupHamburgerMenu,
    updateFooterYear,
    updateLastModified,
    Modal,
    initializeModals,
    LoadingSpinner,
    Storage,
    FormValidator,
    debounce,
    throttle,
    formatDate,
    capitalizeFirstLetter,
    truncateText,
    displayErrorMessage,
    initializeCommon
};