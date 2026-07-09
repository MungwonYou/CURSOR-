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
  renderOrgCharts();
  renderAffiliates();
  renderProducts();
  renderEquipmentTables();
  renderCustomers();
  renderCertificates();
  initSalesChart();
}

function renderOrgCharts() {
  renderTaehwaOrg();
  renderNewhanamOrg();
}

function orgPhoto(id, alt) {
  if (!id) return '';
  return `<img src="/newhanam/assets/people/${id}.png" alt="${alt || ''}" class="org-photo" loading="lazy" width="72" height="84" />`;
}

function orgPersonCard(roleKey, person, extraClass = '') {
  return `
    <div class="org-person ${extraClass}">
      ${orgPhoto(person.photo, person.name)}
      <div class="org-person-text">
        <span class="org-role">${t(roleKey)}</span>
        <strong>${person.name}</strong>
      </div>
    </div>`;
}

function renderTaehwaOrg() {
  const el = document.getElementById('taehwa-org');
  if (!el) return;
  const d = ORG_DATA.taehwa;

  const domesticHtml = d.domestic.map((div) => `
    <div class="org-division">
      <div class="org-division-head">${t(`org.${div.key}`)} <span>(${div.count})</span></div>
      <ul class="org-chip-list">${div.items.map((item) => `<li>${item}</li>`).join('')}</ul>
    </div>
  `).join('');

  const overseasHtml = d.overseas.regions.map((region) => `
    <div class="org-region">
      <div class="org-region-head">${region.country}</div>
      <ul class="org-chip-list">
        ${region.items.map((item) => {
          const hl = item === region.highlight ? ' org-chip--highlight' : '';
          return `<li class="${hl}">${item}</li>`;
        }).join('')}
      </ul>
    </div>
  `).join('');

  el.innerHTML = `
    <div class="org-tree">
      <div class="org-level org-level--top">
        ${orgPersonCard('org.chairman', d.chairman, 'org-person--chairman')}
        <div class="org-connector-v"></div>
        ${orgPersonCard('org.viceChairman', d.viceChairman, 'org-person--vice')}
      </div>
      <div class="org-level org-level--centers">
        ${d.centers.map((c) => `
          <div class="org-center org-center--${c.id}">${t(`org.${c.key}`)}</div>
        `).join('')}
      </div>
      <div class="org-split">
        <div class="org-split-col">
          <h4 class="org-split-title">${t('org.domestic')}</h4>
          <div class="org-division-grid">${domesticHtml}</div>
        </div>
        <div class="org-split-col">
          <h4 class="org-split-title">${t('org.overseas')} (${d.overseas.count})</h4>
          <div class="org-region-grid">${overseasHtml}</div>
        </div>
      </div>
    </div>`;
}

function renderNewhanamOrg() {
  const el = document.getElementById('newhanam-org');
  if (!el) return;
  const d = ORG_DATA.newhanam;
  const hc = d.headcount;

  const adminRows = hc.admin.map(([label, count]) => `<tr><td>${label}</td><td>${count}</td></tr>`).join('');
  const p1Rows = hc.production1.items.map(([label, count]) => `<tr><td>${label}</td><td>${count}</td></tr>`).join('');
  const p2Rows = hc.production2.items.map(([label, count]) => `<tr><td>${label}</td><td>${count}</td></tr>`).join('');
  const supRows = hc.support.map(([label, count]) => `<tr><td>${label}</td><td>${count}</td></tr>`).join('');

  const teamsHtml = d.teams.map((team) => {
    const leaderHtml = team.leader
      ? `<div class="org-team-leader">
          ${orgPhoto(team.leader.photo, team.leader.name)}
          <div><span>${t(`org.${team.leader.rankKey}`)}</span><strong>${team.leader.name}</strong></div>
        </div>`
      : '';
    const unitsHtml = team.units.map((unit) => `
      <article class="org-unit">
        <header class="org-unit-head org-unit-head--${team.tone}">
          <div>
            <h5>${t(`org.${unit.key}`)}</h5>
            <span>${t(`org.${unit.leader.rankKey}`)} · ${unit.leader.name}</span>
          </div>
        </header>
        ${orgPhoto(unit.leader.photo, unit.leader.name)}
        <div class="org-unit-body">
          <span class="org-unit-label">${t('org.responsibilities')}</span>
          <ul>${unit.tasks.map((task) => `<li>${task}</li>`).join('')}</ul>
        </div>
      </article>
    `).join('');

    return `
      <section class="org-team org-team--${team.tone}">
        <header class="org-team-header">
          <h4>${t(`org.${team.key}`)}</h4>
          ${leaderHtml}
        </header>
        <div class="org-unit-grid">${unitsHtml}</div>
      </section>`;
  }).join('');

  el.innerHTML = `
    <div class="nh-org">
      <div class="nh-org-meta">
        <span>${t('org.effectiveDate')}: ${d.effectiveDate}</span>
      </div>
      <div class="nh-headcount">
        <h4>${t('org.headcountTitle')} · ${t('org.headcountTotal')} <strong>${hc.total}</strong></h4>
        <div class="nh-headcount-grid">
          <div class="nh-hc-table">
            <table class="data-table data-table--compact">
              <tbody>${adminRows}</tbody>
            </table>
          </div>
          <div class="nh-hc-table">
            <div class="nh-hc-group-title">${t('org.production1Group')} (${hc.production1.total})</div>
            <table class="data-table data-table--compact"><tbody>${p1Rows}</tbody></table>
          </div>
          <div class="nh-hc-table">
            <div class="nh-hc-group-title">${t('org.production2Group')} (${hc.production2.total})</div>
            <table class="data-table data-table--compact"><tbody>${p2Rows}</tbody></table>
          </div>
          <div class="nh-hc-table">
            <div class="nh-hc-group-title">${t('org.supportGroup')}</div>
            <table class="data-table data-table--compact"><tbody>${supRows}</tbody></table>
          </div>
        </div>
      </div>
      <div class="nh-gm-card">
        ${orgPhoto(d.gm.photo, d.gm.name)}
        <span class="org-role">${t('org.generalManager')}</span>
        <strong>${d.gm.name}</strong>
        <span class="nh-gm-sub">${d.gm.subtitle}</span>
      </div>
      <div class="nh-teams">${teamsHtml}</div>
    </div>`;
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
