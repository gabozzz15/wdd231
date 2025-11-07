document.addEventListener('DOMContentLoaded', () => {
  const navToggle = document.getElementById('navToggle');
  const primaryNav = document.getElementById('primary-nav');

  if (!navToggle || !primaryNav) return;

  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    const newState = !expanded;

    navToggle.setAttribute('aria-expanded', String(newState));
    navToggle.setAttribute('aria-label', newState ? 'Cerrar navegación' : 'Abrir navegación');

    primaryNav.classList.toggle('is-open', newState);
  });

  primaryNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 768) { 
        navToggle.setAttribute('aria-expanded', 'false');
        primaryNav.classList.remove('is-open');
      }
    });
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
      navToggle.setAttribute('aria-expanded', 'false');
      primaryNav.classList.remove('is-open');
      navToggle.focus();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      navToggle.setAttribute('aria-expanded', 'false');
      primaryNav.classList.remove('is-open');
    }
  });
});
