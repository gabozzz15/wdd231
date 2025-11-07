document.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.getElementById('currentYear');
  const lastModifiedEl = document.getElementById('lastModified');

  if (yearEl) {
    const now = new Date();
    yearEl.textContent = now.getFullYear();
  }

  if (lastModifiedEl) {
    lastModifiedEl.textContent = document.lastModified;
  }
});
