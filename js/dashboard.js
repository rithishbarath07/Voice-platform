/* VOICE Healthcare CRM – Dashboard Analytics Engine */

'use strict';

const HC_CHART_COLORS = {
  blue: '#18A9E5',
  blueLight: 'rgba(24, 169, 229, 0.25)',
  gold: '#F4C542',
  goldLight: 'rgba(244, 197, 66, 0.25)',
  green: '#10b981',
  red: '#f87171',
  purple: '#8b5cf6',
  navy: '#0B1E33',
};

let hcCharts = {};

function hcGradient(ctx, c1, c2, vertical = true) {
  const g = vertical
    ? ctx.createLinearGradient(0, 0, 0, 280)
    : ctx.createLinearGradient(0, 0, 400, 0);
  g.addColorStop(0, c1);
  g.addColorStop(1, c2);
  return g;
}

function hcChartDefaults() {
  Chart.defaults.font.family = "'Inter', sans-serif";
  Chart.defaults.color = '#8292A6';
  Chart.defaults.plugins.legend.display = false;
  Chart.defaults.plugins.tooltip.backgroundColor = '#334155';
  Chart.defaults.plugins.tooltip.padding = 12;
  Chart.defaults.plugins.tooltip.cornerRadius = 10;
  Chart.defaults.plugins.tooltip.titleFont = { family: "'Plus Jakarta Sans', sans-serif", weight: '600', size: 13 };
  Chart.defaults.animation.duration = 800;
  Chart.defaults.animation.easing = 'easeOutCubic';
}

function destroyHcCharts() {
  Object.values(hcCharts).forEach(c => c && c.destroy());
  hcCharts = {};
}

function animateHcCounters() {
  document.querySelectorAll('.hc-counter').forEach(el => {
    const target = parseFloat(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const duration = 1600;
    const start = performance.now();
    const update = now => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = eased * target;
      el.textContent = prefix + (decimals ? val.toFixed(decimals) : Math.floor(val).toLocaleString()) + suffix;
      if (p < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  });
}

function initHcSparklines() {
  document.querySelectorAll('.hc-spark-canvas').forEach(canvas => {
    const color = canvas.dataset.color || HC_CHART_COLORS.blue;
    const data = (canvas.dataset.points || '3,5,4,7,6,8,9,7,10,11').split(',').map(Number);
    const ctx = canvas.getContext('2d');
    const w = canvas.width = canvas.offsetWidth * 2;
    const h = canvas.height = 64;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const step = w / (data.length - 1);

    ctx.clearRect(0, 0, w, h);
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    if (color.startsWith('#')) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      grad.addColorStop(0, `rgba(${r},${g},${b},0.35)`);
      grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
    } else {
      grad.addColorStop(0, 'rgba(24,169,229,0.35)');
      grad.addColorStop(1, 'rgba(24,169,229,0)');
    }

    ctx.beginPath();
    data.forEach((v, i) => {
      const x = i * step;
      const y = h - ((v - min) / range) * (h - 16) - 8;
      if (i === 0) ctx.moveTo(x, y);
      else {
        const px = (i - 1) * step;
        const py = h - ((data[i - 1] - min) / range) * (h - 16) - 8;
        const cpx = (px + x) / 2;
        ctx.bezierCurveTo(cpx, py, cpx, y, x, y);
      }
    });
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.beginPath();
    data.forEach((v, i) => {
      const x = i * step;
      const y = h - ((v - min) / range) * (h - 16) - 8;
      if (i === 0) ctx.moveTo(x, y);
      else {
        const px = (i - 1) * step;
        const py = h - ((data[i - 1] - min) / range) * (h - 16) - 8;
        const cpx = (px + x) / 2;
        ctx.bezierCurveTo(cpx, py, cpx, y, x, y);
      }
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.stroke();
  });
}

function initOverallHcpInsights() {
  const el = document.getElementById('chartOverallHcpInsights');
  if (!el || typeof Chart === 'undefined') return;
  const ctx = el.getContext('2d');
  const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  hcCharts.insights = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Enrolled',
          data: [820, 940, 1020, 1180, 1240, 1380, 1520, 1680, 1820, 1950, 2100, 2284],
          borderColor: HC_CHART_COLORS.blue,
          backgroundColor: hcGradient(ctx, 'rgba(24,169,229,0.35)', 'rgba(24,169,229,0)'),
          fill: true,
          tension: 0.42,
          borderWidth: 2.5,
          pointRadius: 0,
          pointHoverRadius: 6,
        },
        {
          label: 'Active',
          data: [620, 710, 780, 890, 920, 1040, 1120, 1240, 1310, 1420, 1480, 1562],
          borderColor: HC_CHART_COLORS.gold,
          backgroundColor: 'transparent',
          tension: 0.42,
          borderWidth: 2,
          borderDash: [0],
          pointRadius: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: { top: 8, right: 8, bottom: 0, left: 0 } },
      interaction: { mode: 'index', intersect: false },
      scales: {
        x: { grid: { display: false }, border: { display: false } },
        y: { grid: { color: 'rgba(0,0,0,0.04)' }, border: { display: false }, ticks: { callback: v => (v / 1000) + 'k' } },
      },
      plugins: {
        legend: { display: true, position: 'top', align: 'end', labels: { boxWidth: 8, usePointStyle: true, pointStyle: 'circle', padding: 16 } },
        tooltip: { callbacks: { label: c => `${c.dataset.label}: ${c.parsed.y.toLocaleString()}` } },
      },
    },
  });
}

function initOverallHcpActivity() {
  const el = document.getElementById('chartOverallHcpActivity');
  if (!el) return;
  const ctx = el.getContext('2d');
  const labels = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'];
  hcCharts.activity = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Touchpoints',
        data: [4200, 5100, 4800, 6200, 5800, 7100, 6800, 7420],
        backgroundColor: (c) => {
          const g = c.chart.ctx.createLinearGradient(0, 0, 0, 280);
          g.addColorStop(0, '#4CC0FF');
          g.addColorStop(1, HC_CHART_COLORS.blue);
          return g;
        },
        borderRadius: 8,
        borderSkipped: false,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { grid: { display: false }, border: { display: false } },
        y: { grid: { color: 'rgba(0,0,0,0.04)' }, border: { display: false } },
      },
    },
  });
}

function initDoctorsDonut() {
  const el = document.getElementById('chartDoctorsDonut');
  if (!el) return;
  const ctx = el.getContext('2d');
  hcCharts.doctors = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Active Doctors', 'Inactive Doctors'],
      datasets: [{
        data: [1562, 722],
        backgroundColor: [HC_CHART_COLORS.blue, 'rgba(130, 146, 166, 0.35)'],
        borderWidth: 0,
        hoverOffset: 8,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      cutout: '72%',
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: c => `${c.label}: ${c.parsed.toLocaleString()}` } },
      },
    },
  });
}

function initCampaignsDonut() {
  const el = document.getElementById('chartCampaignsDonut');
  if (!el) return;
  const ctx = el.getContext('2d');
  hcCharts.campaigns = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Active', 'Inactive', 'Scheduled', 'Completed'],
      datasets: [{
        data: [24, 8, 12, 18],
        backgroundColor: [HC_CHART_COLORS.blue, '#94A3B8', HC_CHART_COLORS.gold, HC_CHART_COLORS.green],
        borderWidth: 0,
        hoverOffset: 6,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      cutout: '68%',
      plugins: { legend: { position: 'bottom', labels: { padding: 14, usePointStyle: true } } },
    },
  });
}

function initJourneyPerformance() {
  const el = document.getElementById('chartJourneyPerformance');
  if (!el) return;
  const ctx = el.getContext('2d');
  hcCharts.journey = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Awareness', 'Engage', 'Educate', 'Prescribe', 'Advocate'],
      datasets: [{
        label: 'Completion %',
        data: [100, 86, 72, 58, 41],
        borderColor: HC_CHART_COLORS.gold,
        backgroundColor: hcGradient(ctx, 'rgba(244,197,66,0.3)', 'rgba(244,197,66,0)'),
        fill: true,
        tension: 0.45,
        borderWidth: 3,
        pointBackgroundColor: '#fff',
        pointBorderColor: HC_CHART_COLORS.gold,
        pointBorderWidth: 2,
        pointRadius: 5,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { min: 0, max: 100, ticks: { callback: v => v + '%' }, grid: { color: 'rgba(0,0,0,0.04)' } },
        x: { grid: { display: false } },
      },
    },
  });
}

function initJourneySuccessRate() {
  const el = document.getElementById('chartJourneySuccess');
  if (!el) return;
  const ctx = el.getContext('2d');
  hcCharts.success = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Onboarding', 'Education', 'Sample', 'Follow-up', 'Retention'],
      datasets: [{
        data: [92, 78, 65, 71, 84],
        backgroundColor: [
          HC_CHART_COLORS.blue,
          '#4CC0FF',
          HC_CHART_COLORS.gold,
          '#94A3B8',
          '#64748B',
        ],
        borderRadius: 6,
      }],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { max: 100, ticks: { callback: v => v + '%' }, grid: { color: 'rgba(0,0,0,0.04)' } },
        y: { grid: { display: false } },
      },
    },
  });
}

function initChannelChart() {
  const el = document.getElementById('chartChannelMix');
  if (!el) return;
  const ctx = el.getContext('2d');
  hcCharts.channels = new Chart(ctx, {
    type: 'polarArea',
    data: {
      labels: ['Telecalls', 'Email', 'SMS', 'WhatsApp'],
      datasets: [{
        data: [42, 28, 18, 12],
        backgroundColor: [
          'rgba(24,169,229,0.75)',
          'rgba(76,192,255,0.65)',
          'rgba(244,197,66,0.75)',
          'rgba(16,185,129,0.7)',
        ],
        borderWidth: 0,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { r: { grid: { color: 'rgba(0,0,0,0.05)' } } },
      plugins: {
        legend: { display: true, position: 'right', labels: { usePointStyle: true, padding: 12 } },
      },
    },
  });
}

function initEngagementHeatmap() {
  const wrap = document.getElementById('hcEngagementHeatmap');
  if (!wrap) return;
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const rows = 6;
  const intensities = [
    [0.3, 0.5, 0.7, 0.8, 0.6, 0.4, 0.35],
    [0.4, 0.6, 0.75, 0.85, 0.7, 0.5, 0.4],
    [0.5, 0.7, 0.9, 0.95, 0.8, 0.55, 0.45],
    [0.45, 0.65, 0.8, 0.88, 0.75, 0.5, 0.4],
    [0.35, 0.55, 0.7, 0.75, 0.65, 0.45, 0.3],
    [0.25, 0.4, 0.5, 0.55, 0.45, 0.35, 0.25],
  ];
  let html = '<div class="hc-heatmap-grid">';
  days.forEach((day, di) => {
    html += `<div class="hc-heatmap-col"><div class="hc-heatmap-day-label">${day}</div>`;
    for (let r = 0; r < rows; r++) {
      const op = intensities[r][di];
      html += `<div class="hc-heatmap-cell" style="background:rgba(24,169,229,${op})" title="${day} — ${Math.round(op * 100)}%"></div>`;
    }
    html += '</div>';
  });
  html += '</div>';
  wrap.innerHTML = html;
}

function populateHcActivity() {
  const el = document.getElementById('hcActivityList');
  if (!el) return;
  const items = [
    { text: 'Telecall completed with Dr. Sharma (Cardiology)', time: '2 min ago' },
    { text: 'Email campaign opened by 142 HCPs', time: '18 min ago' },
    { text: 'WhatsApp journey step completed', time: '34 min ago' },
    { text: 'South region crossed 90% engagement', time: '1 hour ago' },
    { text: 'SMS blast delivered to 2,840 recipients', time: '2 hours ago' },
    { text: 'New HCP enrolled in West region', time: '3 hours ago' },
  ];
  el.innerHTML = items.map(i => `
    <div class="hc-activity-item">
      <span class="hc-activity-dot"></span>
      <div class="hc-activity-body">
        <p>${i.text}</p>
        <time>${i.time}</time>
      </div>
    </div>
  `).join('');
}

function populateHcTimeline() {
  const el = document.getElementById('hcTimeline');
  if (!el) return;
  const items = [
    { icon: '📞', bg: 'rgba(24,169,229,0.12)', title: 'Telecall completed with Dr. Sharma', meta: 'Cardiology · Mumbai', time: '2m ago' },
    { icon: '✉️', bg: 'rgba(76,192,255,0.12)', title: 'Email campaign opened by 142 HCPs', meta: 'Product Launch Q2', time: '18m ago' },
    { icon: '💬', bg: 'rgba(16,185,129,0.12)', title: 'WhatsApp journey step completed', meta: 'Sample Request Flow', time: '34m ago' },
    { icon: '📊', bg: 'rgba(244,197,66,0.12)', title: 'Region South crossed 90% engagement', meta: 'Regional milestone', time: '1h ago' },
    { icon: '🎯', bg: 'rgba(139,92,246,0.12)', title: 'Journey "Onboarding" success rate +4.2%', meta: 'AI-detected uplift', time: '2h ago' },
    { icon: '📱', bg: 'rgba(24,169,229,0.12)', title: 'SMS blast delivered — 2,840 recipients', meta: 'Webinar Reminder', time: '3h ago' },
  ];
  el.innerHTML = items.map(i => `
    <div class="hc-timeline-item">
      <div class="hc-timeline-dot" style="background:${i.bg}">${i.icon}</div>
      <div class="hc-timeline-content">
        <div class="hc-timeline-title">${i.title}</div>
        <div class="hc-timeline-meta">${i.meta}</div>
      </div>
      <span class="hc-timeline-time">${i.time}</span>
    </div>
  `).join('');
}

function populateHcAiInsights() {
  const el = document.getElementById('hcAiInsights');
  if (!el) return;
  const insights = [
    { icon: '💡', text: '<strong>South region</strong> shows 23% higher telecall connect rates. Consider reallocating 15% of field effort.' },
    { icon: '📈', text: '<strong>WhatsApp</strong> engagement grew 18% WoW — expand sample-request journeys to Tier-2 cities.' },
    { icon: '⚠️', text: '<strong>428 HCPs</strong> inactive 30+ days in North zone. Trigger win-back email sequence.' },
    { icon: '✨', text: '<strong>Journey "Educate"</strong> dropout at step 3 — A/B test shorter content (predicted +12% completion).' },
  ];
  el.innerHTML = insights.map(i => `
    <div class="hc-ai-insight">
      <div class="hc-ai-icon">${i.icon}</div>
      <p class="hc-ai-text">${i.text}</p>
    </div>
  `).join('');
}

function populateHcCampaignTable() {
  const body = document.getElementById('hcCampaignTableBody');
  if (!body || typeof CAMPAIGNS_DATA === 'undefined') return;
  const rows = CAMPAIGNS_DATA.slice(0, 5);
  body.innerHTML = rows.map(c => `
    <div class="table-row" onclick="navigateTo('campaigns')">
      <div>
        <div class="table-campaign-name">${c.name}</div>
        <div class="table-campaign-type">${c.type}</div>
      </div>
      <div><span class="status-badge ${c.status}"><span class="status-dot"></span>${c.status.charAt(0).toUpperCase() + c.status.slice(1)}</span></div>
      <div class="progress-wrap">
        <div class="progress-bar"><div class="progress-fill" style="width:${c.progress}%"></div></div>
        <span class="progress-pct">${c.progress}%</span>
      </div>
      <div style="font-size:13.5px;font-weight:600;color:var(--primary)">${c.rate}</div>
    </div>
  `).join('');
}

function animateRegionBars() {
  document.querySelectorAll('.hc-region-bar').forEach(bar => {
    const w = bar.style.width;
    bar.style.width = '0';
    requestAnimationFrame(() => {
      setTimeout(() => { bar.style.width = w; }, 100);
    });
  });
}

function initHealthcareDashboard() {
  if (typeof Chart === 'undefined') return;
  hcChartDefaults();
  destroyHcCharts();
  initOverallHcpInsights();
  initOverallHcpActivity();
  initDoctorsDonut();
  initCampaignsDonut();
  initJourneyPerformance();
  initJourneySuccessRate();
  initChannelChart();
  initEngagementHeatmap();
  populateHcCampaignTable();
  populateHcActivity();
  initHcSparklines();
  animateHcCounters();
  setTimeout(animateRegionBars, 400);
  setTimeout(() => {
    if (typeof initDashboardEffects === 'function') initDashboardEffects();
  }, 120);
}

window.addEventListener('resize', () => {
  if (document.getElementById('page-dashboard')?.classList.contains('active')) {
    initHcSparklines();
  }
});

function toggleSidebarCollapse() {
  const sidebar = document.getElementById('sidebar');
  const main = document.getElementById('mainContent');
  sidebar.classList.toggle('collapsed');
  main.classList.toggle('sidebar-collapsed');
  setTimeout(() => {
    destroyHcCharts();
    initHealthcareDashboard();
    if (typeof drawCallVolumeChart === 'function') drawCallVolumeChart();
  }, 350);
}

function toggleTheme() {
  document.body.classList.toggle('theme-dark');
  const btn = document.getElementById('themeToggleBtn');
  if (btn) btn.classList.toggle('active');
  destroyHcCharts();
  initHealthcareDashboard();
  if (typeof showToast === 'function') {
    const dark = document.body.classList.contains('theme-dark');
    showToast('info', 'Theme', dark ? 'Dark mode enabled' : 'Light mode enabled');
  }
}

function filterHcDashboard(period, btn) {
  document.querySelectorAll('.hc-filter-pill[data-filter]').forEach(p => p.classList.remove('active'));
  if (btn) btn.classList.add('active');
  showToast('info', 'Filters Applied', `Showing data for: ${period}`);
}

window.initHealthcareDashboard = initHealthcareDashboard;
window.toggleSidebarCollapse = toggleSidebarCollapse;
window.toggleTheme = toggleTheme;
window.filterHcDashboard = filterHcDashboard;
