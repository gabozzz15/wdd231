document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    
    displayApplicationData(urlParams);
    
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
});

function displayApplicationData(urlParams) {
    const applicationData = document.getElementById('application-data');
    
    if (!applicationData) return;
    
    // get form values
    const firstName = urlParams.get('firstName') || 'Not provided';
    const lastName = urlParams.get('lastName') || 'Not provided';
    const email = urlParams.get('email') || 'Not provided';
    const phone = urlParams.get('phone') || 'Not provided';
    const businessName = urlParams.get('businessName') || 'Not provided';
    const timestamp = urlParams.get('timestamp') || new Date().toISOString();
    
    const formattedDate = new Date(timestamp).toLocaleString();
    
    // creating a HTML for application data
    applicationData.innerHTML = `
        <div class="data-row">
            <strong>Name:</strong> ${firstName} ${lastName}
        </div>
        <div class="data-row">
            <strong>Email:</strong> ${email}
        </div>
        <div class="data-row">
            <strong>Phone:</strong> ${phone}
        </div>
        <div class="data-row">
            <strong>Business:</strong> ${businessName}
        </div>
        <div class="data-row">
            <strong>Application Date:</strong> ${formattedDate}
        </div>
    `;
}