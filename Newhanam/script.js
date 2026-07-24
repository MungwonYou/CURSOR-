document.addEventListener('DOMContentLoaded', () => {
  initLanguage();
  initNavbar();
  initMobileMenu();
  initScrollReveal();
  initSalesChart();
  initSmoothScroll();
  renderDynamicContent();
});

let currentLang = 'en';
try {
  currentLang = localStorage.getItem('nh-lang') || 'en';
} catch (_) {
  currentLang = 'en';
}

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
  if (save) {
    try { localStorage.setItem('nh-lang', lang); } catch (_) { /* private mode */ }
  }
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
  const eras = t('history.eras');
  if (!Array.isArray(eras)) return;

  const icons = [
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V9l8-5 8 5v11H4z"/><path d="M9 20v-6h6v6"/></svg>',
    '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1"/></svg>',
    '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="7" width="18" height="10" rx="1"/><path d="M7 7V5h10v2M8 17v2M16 17v2"/></svg>',
    '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2"/><path d="M12 5v2M12 17v2M5 12h2M17 12h2"/></svg>',
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 18h16M6 18V9l6-4 6 4v9"/><path d="M10 18v-5h4v5"/></svg>',
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 14h8l2 6H7l-2-6z"/><path d="M13 8a4 4 0 1 0-1 2.6"/><path d="M15 4v4h4"/></svg>',
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l1.8 5.5H20l-4.4 3.2 1.7 5.3L12 14.8 6.7 17l1.7-5.3L4 8.5h6.2L12 3z"/></svg>',
  ];

  container.innerHTML = `
    <div class="ht-rail">
      ${eras.map((era, i) => {
        const side = i % 2 === 0 ? 'above' : 'below';
        const [year, month = ''] = String(era.date).split('.');
        const title = era.items[0] || '';
        const rest = era.items.slice(1);
        const label = title.length > 22 ? `${title.slice(0, 20)}…` : title;
        return `
          <article class="ht-step ht-step--${side} reveal" data-tone="${i % 7}" style="--i:${i}">
            <div class="ht-detail">
              <h4 class="ht-title">${title}</h4>
              ${rest.length
                ? `<ul class="ht-list">${rest.map((item) => `<li>${item}</li>`).join('')}</ul>`
                : `<p class="ht-body">${era.date}</p>`}
            </div>
            <div class="ht-band">
              <span class="ht-year">${year}</span>
              <span class="ht-month">${month ? `.${month}` : ''}</span>
              <span class="ht-icon">${icons[i % icons.length]}</span>
              <span class="ht-label">${label}</span>
            </div>
          </article>`;
      }).join('')}
    </div>
  `;
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
    const cols = t('equipment.measureCols');
    measure.innerHTML = `
      <table class="data-table data-table--compact data-table--measure">
        <colgroup>
          <col class="col-name" />
          <col class="col-range" />
          <col class="col-qty" />
        </colgroup>
        <thead><tr><th>${cols[0]}</th><th>${cols[1]}</th><th>${cols[2]}</th></tr></thead>
        <tbody>${t('equipment.measureRows').map((r) => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('')}</tbody>
        <tfoot><tr><td colspan="3" class="table-total">${t('equipment.measureTotal')}</td></tr></tfoot>
      </table>`;
  }

  const gauge = document.getElementById('equipment-gauge');
  if (gauge) {
    const cols = t('equipment.gaugeCols');
    gauge.innerHTML = `
      <table class="data-table data-table--compact data-table--gauge">
        <colgroup>
          <col class="col-name" />
          <col class="col-qty" />
        </colgroup>
        <thead><tr><th>${cols[0]}</th><th>${cols[1]}</th></tr></thead>
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
    document.body.classList.toggle('menu-open', open);
  });

  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
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
