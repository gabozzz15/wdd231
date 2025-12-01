const attractionsContainer = document.getElementById('attractions-container');
const visitorMessage = document.getElementById('visitor-message');

// Load and display attractions
async function loadAttractions() {
  try {
    const response = await fetch('data/attractions.mjs');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const text = await response.text();
    
    // Extract the JSON array from the mjs file
    // We'll parse it by finding the attractions array
    const attractionsMatch = text.match(/const attractions = (\[[\s\S]*?\]);/);
    
    if (attractionsMatch) {
      const attractions = eval('(' + attractionsMatch[1] + ')');
      displayAttractions(attractions);
    } else {
      // Try alternative format if first doesn't match
      const exportMatch = text.match(/export default (\[[\s\S]*?\]);/);
      if (exportMatch) {
        const attractions = eval('(' + exportMatch[1] + ')');
        displayAttractions(attractions);
      } else {
        console.error('Could not parse attractions data from mjs file');
        displayError();
      }
    }
  } catch (error) {
    console.error('Error loading attractions:', error);
    displayError();
  }
}

function displayAttractions(attractions) {
  attractionsContainer.innerHTML = '';
  
  attractions.forEach(attraction => {
    const card = document.createElement('article');
    card.className = 'attraction-card';
    
    card.innerHTML = `
      <h2>${attraction.name}</h2>
      <figure>
        <img src="images/${attraction.image}" alt="${attraction.name}" loading="lazy">
      </figure>
      <address>${attraction.address}</address>
      <p>${attraction.description}</p>
      <a href="#" class="learn-more">Learn More</a>
    `;
    
    attractionsContainer.appendChild(card);
  });
}

function displayError() {
  attractionsContainer.innerHTML = `
    <div class="error-message" style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
      <h3>Unable to load attractions</h3>
      <p>Please check back later or contact us for information about Caracas attractions.</p>
    </div>
  `;
}

function displayVisitorMessage() {
  const lastVisit = localStorage.getItem('lastVisit');
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
  localStorage.setItem('lastVisit', currentVisit.toString());  
  visitorMessage.innerHTML = `<p>${message}</p>`;
}

function setupLearnMoreButtons() {
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('learn-more')) {
      e.preventDefault();
      const attractionName = e.target.closest('.attraction-card').querySelector('h2').textContent;
      alert(`More information about ${attractionName} will be available soon!`);
    }
  });
}

document.addEventListener('DOMContentLoaded', function() {
  
  loadAttractions();
  displayVisitorMessage();
  setupLearnMoreButtons();
  
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