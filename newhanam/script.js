document.addEventListener('DOMContentLoaded', () => {
  initLanguage();
  initNavbar();
  initMobileMenu();
  initScrollReveal();
  initSalesChart();
  initSmoothScroll();
  renderDynamicContent();
});

let currentLang = localStorage.getItem('nh-lang') || 'en';

function t(key) {
  const keys = key.split('.');
  let val = NH_I18N[currentLang];
  for (const k of keys) val = val?.[k];
  return val ?? key;
}

function initLanguage() {
  document.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
  });
  setLanguage(currentLang, false);
}

function setLanguage(lang, save = true) {
  if (!NH_I18N[lang]) return;
  currentLang = lang;
  if (save) localStorage.setItem('nh-lang', lang);
  document.documentElement.lang = lang === 'vi' ? 'vi' : lang === 'ko' ? 'ko' : 'en';

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    const val = t(key);
    if (typeof val === 'string' && val.includes('<')) el.innerHTML = val;
    else if (typeof val === 'string') el.textContent = val;
  });

  document.title = t('meta.title');
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.content = t('meta.description');

  document.querySelectorAll('.lang-btn').forEach((btn) => {
    const active = btn.dataset.lang === lang;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', active);
  });

  renderDynamicContent();
}

function renderDynamicContent() {
  renderHistory();
  renderAffiliates();
  renderProducts();
  renderEquipmentTables();
  renderCustomers();
  renderCertificates();
  initSalesChart();
}

function renderHistory() {
  const container = document.getElementById('history-list');
  if (!container) return;
  container.innerHTML = t('history.items')
    .map(([date, text]) => `
      <article class="history-item reveal">
        ${date ? `<time class="history-date">${date}</time>` : '<span class="history-date history-date--empty"></span>'}
        <p class="history-text">${text}</p>
      </article>
    `)
    .join('');
  observeReveals(container.querySelectorAll('.reveal'));
}

function renderAffiliates() {
  const domestic = document.getElementById('affiliates-domestic');
  const overseas = document.getElementById('affiliates-overseas');
  if (domestic) {
    domestic.innerHTML = t('affiliates.domestic')
      .map(([name, desc]) => `<li class="affiliate-item"><strong>${name}</strong><span>${desc}</span></li>`)
      .join('');
  }
  if (overseas) {
    overseas.innerHTML = t('affiliates.overseas')
      .map(([name, desc]) => `<li class="affiliate-item"><strong>${name}</strong><span>${desc}</span></li>`)
      .join('');
  }
}

function renderProducts() {
  const grid = document.getElementById('products-grid');
  if (!grid) return;
  grid.innerHTML = t('products.list')
    .map((item) => `<div class="product-chip reveal">${item}</div>`)
    .join('');
  observeReveals(grid.querySelectorAll('.reveal'));
}

function renderEquipmentTables() {
  const process = document.getElementById('equipment-process');
  if (process) {
    const cols = t('equipment.cols');
    const rows = t('equipment.rows');
    process.innerHTML = `
      <table class="data-table">
        <thead><tr>${cols.map((c) => `<th>${c}</th>`).join('')}</tr></thead>
        <tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
      </table>`;
  }

  const measure = document.getElementById('equipment-measure');
  if (measure) {
    measure.innerHTML = `
      <table class="data-table data-table--compact">
        <thead><tr><th>Name</th><th>Range</th><th>Q'ty</th></tr></thead>
        <tbody>${t('equipment.measureRows').map((r) => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('')}</tbody>
        <tfoot><tr><td colspan="3" class="table-total">${t('equipment.measureTotal')}</td></tr></tfoot>
      </table>`;
  }

  const gauge = document.getElementById('equipment-gauge');
  if (gauge) {
    gauge.innerHTML = `
      <table class="data-table data-table--compact">
        <thead><tr><th>Go-No Gages</th><th>Q'ty</th></tr></thead>
        <tbody>${t('equipment.gaugeRows').map((r) => `<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('')}</tbody>
        <tfoot><tr><td colspan="2" class="table-total">${t('equipment.gaugeTotal')}</td></tr></tfoot>
      </table>`;
  }
}

function renderCustomers() {
  const list = document.getElementById('customers-list');
  if (!list) return;
  list.innerHTML = t('customers.list')
    .map((name) => `<div class="customer-badge reveal">${name}</div>`)
    .join('');
  observeReveals(list.querySelectorAll('.reveal'));
}

function renderCertificates() {
  const g1 = document.getElementById('cert-group-1');
  const g2 = document.getElementById('cert-group-2');
  if (g1) g1.innerHTML = t('certificates.group1').map((c) => `<span class="cert-badge">${c}</span>`).join('');
  if (g2) g2.innerHTML = t('certificates.group2').map((c) => `<span class="cert-badge">${c}</span>`).join('');
}

function initSalesChart() {
  const chart = document.getElementById('sales-chart');
  if (!chart) return;
  const max = Math.max(...NH_SALES.map((s) => s.value));
  chart.innerHTML = NH_SALES.map((s) => {
    const h = Math.round((s.value / max) * 100);
    const growth = s.growth !== null
      ? `<span class="bar-growth ${s.growth >= 0 ? 'up' : 'down'}">${s.growth >= 0 ? '▲' : '▼'} ${Math.abs(s.growth)}%</span>`
      : '';
    return `
      <div class="bar-col">
        <div class="bar-value">${s.value}</div>
        ${growth}
        <div class="bar-track"><div class="bar-fill" style="height:${h}%"></div></div>
        <div class="bar-year">${s.year}</div>
      </div>`;
  }).join('');
}

function initNavbar() {
  const navbar = document.getElementById('navbar');
  const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

function initMobileMenu() {
  const toggle = document.getElementById('menu-toggle');
  const menu = document.getElementById('mobile-menu');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open);
  });

  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

function initScrollReveal() {
  observeReveals(document.querySelectorAll('.reveal'));
}

function observeReveals(elements) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -30px 0px' }
  );
  elements.forEach((el) => observer.observe(el));
}

function initSmoothScroll() {
  const sections = document.querySelectorAll('section[id], header[id]');
  const navLinks = document.querySelectorAll('.nav-link, .mobile-link');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach((link) => {
            link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
          });
        }
      });
    },
    { threshold: 0.25, rootMargin: '-70px 0px -55% 0px' }
  );

  sections.forEach((section) => observer.observe(section));
}
