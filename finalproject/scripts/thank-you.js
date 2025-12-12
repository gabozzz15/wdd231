const detailEmail = document.getElementById('detail-email');
const detailCategories = document.getElementById('detail-categories');
const detailAlerts = document.getElementById('detail-alerts');
const detailDate = document.getElementById('detail-date');

function displaySubscriptionDetails() {
    const urlParams = new URLSearchParams(window.location.search);

    // Get values from URL parameters
    const email = urlParams.get('email') || 'Not provided';
    const categories = urlParams.getAll('categories') || ['General'];
    const weatherAlerts = urlParams.get('weather-alerts') === 'on' ? 'Yes' : 'No';
    const timestamp = urlParams.get('timestamp') || new Date().toISOString();

    const subscriptionDate = new Date(timestamp);
    const formattedDate = subscriptionDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    detailEmail.textContent = email;
    detailCategories.textContent = categories.length > 0 ? categories.join(', ') : 'General';
    detailAlerts.textContent = weatherAlerts;
    detailDate.textContent = formattedDate;

    saveSubscriptionToStorage(email, categories, weatherAlerts, timestamp);
}

function saveSubscriptionToStorage(email, categories, weatherAlerts, timestamp) {
    try {
        const subscription = {
            email,
            categories,
            weatherAlerts,
            timestamp,
            confirmedAt: new Date().toISOString()
        };

        // Get existing subscriptions
        const subscriptions = JSON.parse(localStorage.getItem('newsletter-subscriptions') || '[]');

        // Add new subscription
        subscriptions.push(subscription);

        // Save back to localStorage
        localStorage.setItem('newsletter-subscriptions', JSON.stringify(subscriptions));

        console.log('Subscription saved to localStorage:', subscription);
    } catch (error) {
        console.error('Error saving subscription to localStorage:', error);
    }
}

function hasUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.toString().length > 0;
}
function showSampleData() {
    const sampleDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    detailEmail.textContent = 'subscriber@example.com';
    detailCategories.textContent = 'General, Technology, Business';
    detailAlerts.textContent = 'Yes';
    detailDate.textContent = sampleDate;

    const detailsContainer = document.getElementById('subscription-details');
    const notice = document.createElement('div');
    notice.className = 'subscription-notice';
    notice.innerHTML = `
        <p style="color: var(--accent-orange); font-size: 0.9rem; text-align: center; margin-top: 1rem;">
            <i class="fas fa-info-circle"></i> Displaying sample data. Form submission would show your actual details.
        </p>
    `;
    detailsContainer.appendChild(notice);
}
document.addEventListener('DOMContentLoaded', () => {
    if (hasUrlParameters()) {
        displaySubscriptionDetails();
    } else {
        showSampleData();
    }

    const currentYearElement = document.getElementById('current-year');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }

    const lastModifiedElement = document.getElementById('last-modified');
    if (lastModifiedElement) {
        lastModifiedElement.textContent = `Last modified: ${document.lastModified}`;
    }

    const hamburger = document.querySelector('.hamburger');
    const primaryNav = document.querySelector('.primary-nav');

    if (hamburger && primaryNav) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            primaryNav.classList.toggle('active');
        });
    }
});