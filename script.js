document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileMenu();
  initScrollReveal();
  initStarRatings();
  initSkillBars();
  initSmoothScroll();
});

/** Navbar scroll effect */
function initNavbar() {
  const navbar = document.getElementById('navbar');

  const handleScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/** Mobile menu toggle */
function initMobileMenu() {
  const toggle = document.getElementById('menu-toggle');
  const menu = document.getElementById('mobile-menu');
  const links = document.querySelectorAll('.mobile-link');

  toggle.addEventListener('click', () => {
    menu.classList.toggle('hidden');
  });

  links.forEach((link) => {
    link.addEventListener('click', () => {
      menu.classList.add('hidden');
    });
  });
}

/** Intersection Observer for scroll reveal */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  reveals.forEach((el) => observer.observe(el));
}

/** Render star ratings from data-level attribute */
function initStarRatings() {
  document.querySelectorAll('.star-rating').forEach((el) => {
    const level = parseInt(el.dataset.level, 10);
    const filled = '★'.repeat(level);
    const empty = '☆'.repeat(5 - level);
    el.textContent = filled + empty;
  });
}

/** Animate skill bars when visible */
function initSkillBars() {
  const fills = document.querySelectorAll('.skill-fill');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const width = entry.target.dataset.width;
          entry.target.style.setProperty('--fill-width', `${width}%`);
          entry.target.classList.add('animated');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  fills.forEach((fill) => observer.observe(fill));
}

/** Highlight active nav link on scroll */
function initSmoothScroll() {
  const sections = document.querySelectorAll('section[id], header[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach((link) => {
            const isActive = link.getAttribute('href') === `#${id}`;
            link.classList.toggle('active', isActive);
          });
        }
      });
    },
    { threshold: 0.3, rootMargin: '-80px 0px -50% 0px' }
  );

  sections.forEach((section) => observer.observe(section));
}
