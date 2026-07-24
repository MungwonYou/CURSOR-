document.addEventListener('DOMContentLoaded', () => {
  initI18n();
  initNavbar();
  initMobileMenu();
  initScrollReveal();
  initStarRatings();
  initSkillBars();
  initActiveNav();
});

function initNavbar() {
  const navbar = document.getElementById('navbar');
  const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

function initMobileMenu() {
  const toggle = document.getElementById('menu-toggle');
  const menu = document.getElementById('mobile-menu');
  const links = document.querySelectorAll('.mobile-link');

  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('hidden') === false;
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
  });

  links.forEach((link) => {
    link.addEventListener('click', () => {
      menu.classList.add('hidden');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

function initScrollReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
  );

  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
}

function initStarRatings() {
  document.querySelectorAll('.star-rating').forEach((el) => {
    const level = parseInt(el.dataset.level, 10);
    el.textContent = '★'.repeat(level) + '☆'.repeat(5 - level);
  });
}

function initSkillBars() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.setProperty('--fill-width', `${entry.target.dataset.width}%`);
          entry.target.classList.add('animated');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  document.querySelectorAll('.skill-fill').forEach((fill) => observer.observe(fill));
}

function initActiveNav() {
  const sections = document.querySelectorAll('section[id], header[id]');
  const links = document.querySelectorAll('.nav-link, .mobile-link');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          links.forEach((link) => {
            link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
          });
        }
      });
    },
    { threshold: 0.25, rootMargin: '-70px 0px -55% 0px' }
  );

  sections.forEach((section) => observer.observe(section));
}
