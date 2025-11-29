document.addEventListener('DOMContentLoaded', function() {
    const timestampField = document.getElementById('timestamp');
    const now = new Date();
    timestampField.value = now.toISOString();
    
    document.getElementById('copyright').textContent = `© ${new Date().getFullYear()} Venezuelan Chamber of Commerce`;
    document.getElementById('lastModified').textContent = `Last Modified: ${document.lastModified}`;
    
    const hamburger = document.querySelector('.hamburger');
    const primaryNav = document.querySelector('.primary-nav');
    
    if (hamburger && primaryNav) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            primaryNav.classList.toggle('is-open');
        });
    }
    
    setupModals();
});

// Modal functionality
function setupModals() {
    const modalLinks = document.querySelectorAll('.info-link');
    const modals = document.querySelectorAll('.modal');
    const closeButtons = document.querySelectorAll('.modal-close');
    
    modalLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const modalId = this.getAttribute('href');
            const modal = document.querySelector(modalId);
            if (modal) {
                modal.style.display = 'block';
                document.body.style.overflow = 'hidden';
            }
        });
    });
    
    closeButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const modal = this.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
                document.body.style.overflow = '';
            }
        });
    });
    
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.style.display = 'none';
                document.body.style.overflow = '';
            }
        });
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            modals.forEach(modal => {
                if (modal.style.display === 'block') {
                    modal.style.display = 'none';
                    document.body.style.overflow = '';
                }
            });
        }
    });
}