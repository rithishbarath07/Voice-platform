/* VOICE Campaign Module – Premium enterprise UI */

'use strict';

let campaignState = {
  currentFilter: 'all',
  currentPage: 1,
  pageSize: 10,
  searchQuery: '',
  sortKey: 'name',
  sortDir: 'asc',
  selectedRows: new Set(),
  advancedFilters: { type: '', minHcp: 0, dateFrom: '', dateTo: '' },
};

let journeyState = {
  campaignId: null,
  steps: [],
  selectedStepId: null,
  stepCounter: 0,
};

let campCharts = {};
let viewCampaignId = null;

const JOURNEY_STORAGE_KEY = 'voice_campaign_journeys';

const CHANNEL_META = {
  email: { icon: '✉', label: 'Email', color: '#18A9E5', bg: 'rgba(24,169,229,0.12)' },
  sms: { icon: '💬', label: 'SMS', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
  whatsapp: { icon: '📱', label: 'WhatsApp', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  telecall: { icon: '📞', label: 'Telecall', color: '#F4C542', bg: 'rgba(244,197,66,0.15)' },
};

const DEFAULT_JOURNEYS = {
  1: [
    { id: 's1', type: 'channel', channel: 'email', template: 'HCP Introduction Email', duration: '0', condition: '', reminder: '', desc: 'Welcome HCPs to Spring program' },
    { id: 's2', type: 'channel', channel: 'sms', template: 'Webinar Reminder SMS', duration: '3', condition: '', reminder: '', desc: 'Follow-up after email' },
    { id: 's3', type: 'conditional', channel: 'whatsapp', template: 'WhatsApp Sample Flow', duration: '7', condition: 'If email not opened', reminder: '', desc: 'Re-engage non-openers' },
    { id: 's4', type: 'reminder', channel: 'telecall', template: 'Telecall Outreach Script', duration: '14', condition: '', reminder: 'Gentle follow-up', desc: 'Rep outreach for high-value HCPs' },
  ],
  7: [
    { id: 's1', type: 'channel', channel: 'telecall', template: 'Telecall Outreach Script', duration: '0', condition: '', reminder: '', desc: 'Inbound qualification call' },
    { id: 's2', type: 'channel', channel: 'email', template: 'Sample Request Follow-up', duration: '1', condition: '', reminder: '', desc: 'Post-call materials' },
    { id: 's3', type: 'reminder', channel: 'sms', template: 'Webinar Reminder SMS', duration: '5', condition: '', reminder: 'Final reminder', desc: 'Close the loop' },
  ],
};

function loadCampaignJourneys() {
  try {
    const raw = localStorage.getItem(JOURNEY_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveCampaignJourneys(store) {
  try {
    localStorage.setItem(JOURNEY_STORAGE_KEY, JSON.stringify(store));
  } catch { /* ignore */ }
}

function getCampaignJourney(campaignId) {
  const store = loadCampaignJourneys();
  if (store[campaignId]?.length) return store[campaignId];
  return DEFAULT_JOURNEYS[campaignId] || null;
}

function setCampaignJourney(campaignId, steps) {
  const store = loadCampaignJourneys();
  store[campaignId] = steps.map(s => ({ ...s }));
  saveCampaignJourneys(store);
}

function hasCampaignJourney(campaignId) {
  const j = getCampaignJourney(campaignId);
  return j && j.length > 0;
}

function durationLabel(days) {
  const d = String(days);
  if (d === '0') return 'Immediately';
  if (d === '1') return 'After 1 day';
  if (d === '3') return 'After 3 days';
  if (d === '7') return 'After 7 days';
  if (d === '14') return 'After 14 days';
  return `After ${d} days`;
}

function stepTypeLabel(step) {
  if (step.type === 'conditional') return 'Conditional branch';
  if (step.type === 'reminder') return 'Reminder';
  return CHANNEL_META[step.channel]?.label || 'Channel';
}

const CAMP_ACTIVITY = [
  { icon: '✅', text: '<b>Spring Outreach</b> reached 72% completion', time: '2m ago' },
  { icon: '📧', text: 'Email journey sent to <b>142 HCPs</b>', time: '18m ago' },
  { icon: '📞', text: '<b>Upsell Campaign</b> connected 410 calls today', time: '34m ago' },
  { icon: '⏸', text: '<b>Customer Winback</b> marked completed', time: '1h ago' },
  { icon: '🛤️', text: 'New journey draft saved for Q2 Survey', time: '2h ago' },
];

const CAMP_AI = [
  { tag: 'Opportunity', color: 'blue', text: 'Shift 15% capacity to Upsell — 79% connect rate vs 71% average.' },
  { tag: 'Alert', color: 'gold', text: 'Q2 Survey launches in 7 days — preload 4,500 HCP segment.' },
  { tag: 'Insight', color: 'green', text: 'WhatsApp reminders show 18% higher open rates this week.' },
];

function getHcpCount(c) {
  return c.hcpCount || Math.round(c.contacts * 0.78);
}

function initCampaignsModule() {
  if (!document.getElementById('campaignTableBody')) return;
  renderCampaignTable();
  updateKPIs();
  populateCampSidebar();
  populateCampEngagement();
  initCampCharts();
  setupCampaignListeners();
}

function setupCampaignListeners() {
  const search = document.getElementById('campaignSearch');
  if (search && !search.dataset.bound) {
    search.dataset.bound = '1';
    search.addEventListener('input', e => {
      campaignState.searchQuery = e.target.value.toLowerCase();
      campaignState.currentPage = 1;
      renderCampaignTable();
    });
  }
}

function getFilteredCampaigns() {
  let list = [...CAMPAIGNS_DATA];
  const f = campaignState.currentFilter;
  if (f !== 'all') list = list.filter(c => c.status === f);

  if (campaignState.searchQuery) {
    const q = campaignState.searchQuery;
    list = list.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.type.toLowerCase().includes(q) ||
      String(getHcpCount(c)).includes(q)
    );
  }

  const af = campaignState.advancedFilters;
  if (af.type) list = list.filter(c => c.type === af.type);
  if (af.minHcp) list = list.filter(c => getHcpCount(c) >= af.minHcp);

  list.sort((a, b) => {
    let va, vb;
    if (campaignState.sortKey === 'hcp') {
      va = getHcpCount(a); vb = getHcpCount(b);
    } else if (campaignState.sortKey === 'date') {
      va = a.startDate; vb = b.startDate;
    } else {
      va = a.name.toLowerCase(); vb = b.name.toLowerCase();
    }
    if (va < vb) return campaignState.sortDir === 'asc' ? -1 : 1;
    if (va > vb) return campaignState.sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  return list;
}

function sortCampaigns(key) {
  if (campaignState.sortKey === key) {
    campaignState.sortDir = campaignState.sortDir === 'asc' ? 'desc' : 'asc';
  } else {
    campaignState.sortKey = key;
    campaignState.sortDir = 'asc';
  }
  renderCampaignTable();
}

function filterCampaigns(status, el) {
  document.querySelectorAll('#page-campaigns .filter-tab').forEach(t => t.classList.remove('active'));
  if (el) el.classList.add('active');
  campaignState.currentFilter = status;
  campaignState.currentPage = 1;
  renderCampaignTable();
}

function renderCampaignTable() {
  const tbody = document.getElementById('campaignTableBody');
  if (!tbody) return;

  const filtered = getFilteredCampaigns();
  const start = (campaignState.currentPage - 1) * campaignState.pageSize;
  const pageData = filtered.slice(start, start + campaignState.pageSize);

  if (!pageData.length) {
    tbody.innerHTML = `<tr><td colspan="9" class="camp-table-empty">No campaigns match your filters.</td></tr>`;
    updatePaginationInfo(filtered.length);
    return;
  }

  tbody.innerHTML = pageData.map(c => {
    const statusLabel = c.status === 'paused' ? 'Inactive' : c.status.charAt(0).toUpperCase() + c.status.slice(1);
    return `
    <tr class="campaign-row" data-campaign-id="${c.id}">
      <td class="col-check"><input type="checkbox" class="row-select" onchange="handleRowSelect(this, ${c.id})" /></td>
      <td class="col-name">
        <div class="campaign-name-cell">
          <div class="campaign-avatar" style="background:linear-gradient(135deg,${c.color},${adjustBrightness(c.color, -25)})">${c.name.charAt(0)}</div>
          <div class="campaign-info">
            <div class="campaign-name">${escapeHtml(c.name)}${hasCampaignJourney(c.id) ? '<span class="camp-journey-badge" title="Journey configured">Journey</span>' : ''}</div>
            <div class="campaign-meta">${c.type} · ${c.calls.toLocaleString()} calls</div>
          </div>
        </div>
      </td>
      <td class="col-hcp"><strong>${getHcpCount(c).toLocaleString()}</strong></td>
      <td class="col-date">${c.startDate}</td>
      <td class="col-type"><span class="type-badge ${c.type === 'Voice Blast' ? 'blast' : c.type === 'Inbound' ? 'inbound' : ''}">${c.type}</span></td>
      <td class="col-status"><span class="status-badge ${c.status}">${statusLabel}</span></td>
      <td class="col-progress">
        <div class="progress-cell">
          <div class="progress-bar"><div class="progress-fill" style="width:${c.progress}%;background:${c.color}"></div></div>
          <span class="progress-text">${c.progress}%</span>
        </div>
      </td>
      <td class="col-rate"><strong>${c.rate}</strong></td>
      <td class="col-actions">
        <div class="camp-action-group">
          <button type="button" class="camp-action-btn view" onclick="viewCampaign(${c.id})" title="View campaign & journey">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            <span>View</span>
          </button>
          <button type="button" class="camp-action-btn journey" onclick="createJourney(${c.id})" title="Create Journey">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="5" cy="6" r="3"/><circle cx="19" cy="18" r="3"/><path d="M8 6h8M8 18h5M14 6l4 12"/></svg>
            <span>Journey</span>
          </button>
          ${c.status === 'active' ? `<button type="button" class="camp-action-btn stop" onclick="stopCampaign(${c.id})" title="Stop">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
            <span>Stop</span>
          </button>` : ''}
          <button type="button" class="camp-action-btn delete" onclick="deleteCampaign(${c.id})" title="Delete">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
            <span>Delete</span>
          </button>
        </div>
      </td>
    </tr>`;
  }).join('');

  updatePaginationInfo(filtered.length);
}

function escapeHtml(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

function handleRowSelect(cb, id) {
  if (cb.checked) campaignState.selectedRows.add(id);
  else campaignState.selectedRows.delete(id);
}

function toggleSelectAll(cb) {
  const filtered = getFilteredCampaigns();
  const start = (campaignState.currentPage - 1) * campaignState.pageSize;
  const pageData = filtered.slice(start, start + campaignState.pageSize);
  document.querySelectorAll('.row-select').forEach((el, i) => {
    if (i < pageData.length) {
      el.checked = cb.checked;
      const id = pageData[i].id;
      if (cb.checked) campaignState.selectedRows.add(id);
      else campaignState.selectedRows.delete(id);
    }
  });
}

function updatePaginationInfo(total) {
  const start = total === 0 ? 0 : (campaignState.currentPage - 1) * campaignState.pageSize + 1;
  const end = Math.min(start + campaignState.pageSize - 1, total);
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set('paginationStart', start);
  set('paginationEnd', end);
  set('paginationTotal', total);

  const totalPages = Math.max(1, Math.ceil(total / campaignState.pageSize));
  const prev = document.getElementById('paginationPrev');
  const next = document.getElementById('paginationNext');
  if (prev) prev.disabled = campaignState.currentPage <= 1;
  if (next) next.disabled = campaignState.currentPage >= totalPages;

  const container = document.getElementById('paginationNumbers');
  if (!container) return;
  let html = '';
  for (let i = 1; i <= totalPages; i++) {
    html += `<button type="button" class="pagination-number ${i === campaignState.currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
  }
  container.innerHTML = html;
}

function goToPage(p) {
  campaignState.currentPage = p;
  renderCampaignTable();
}

function previousPage() {
  if (campaignState.currentPage > 1) goToPage(campaignState.currentPage - 1);
}

function nextPage() {
  const total = Math.ceil(getFilteredCampaigns().length / campaignState.pageSize);
  if (campaignState.currentPage < total) goToPage(campaignState.currentPage + 1);
}

function changePaginationSize(size) {
  campaignState.pageSize = parseInt(size, 10);
  campaignState.currentPage = 1;
  renderCampaignTable();
}

function updateKPIs() {
  const active = CAMPAIGNS_DATA.filter(c => c.status === 'active').length;
  const hcp = CAMPAIGNS_DATA.reduce((s, c) => s + getHcpCount(c), 0);
  const rates = CAMPAIGNS_DATA.filter(c => !isNaN(parseInt(c.rate, 10)));
  const avg = rates.length
    ? (rates.reduce((s, c) => s + parseInt(c.rate, 10), 0) / rates.length).toFixed(1)
    : '0';
  const calls = CAMPAIGNS_DATA.reduce((s, c) => s + c.calls, 0);
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set('kpiActiveCampaigns', active);
  set('kpiTotalContacts', `${(hcp / 1000).toFixed(1)}K`);
  set('kpiAvgEngagement', `${avg}%`);
  set('kpiCallsThisMonth', `${(calls / 1000).toFixed(1)}K`);
}

function populateCampSidebar() {
  const feed = document.getElementById('campActivityFeed');
  if (feed) {
    feed.innerHTML = CAMP_ACTIVITY.map(a => `
      <div class="camp-activity-item">
        <span class="camp-activity-icon">${a.icon}</span>
        <div><p>${a.text}</p><time>${a.time}</time></div>
      </div>`).join('');
  }

  const ai = document.getElementById('campAiList');
  if (ai) {
    ai.innerHTML = CAMP_AI.map(i => `
      <div class="camp-ai-item ${i.color}">
        <span class="camp-ai-tag">${i.tag}</span>
        <p>${i.text}</p>
      </div>`).join('');
  }

}

function populateCampEngagement() {
  const active = CAMPAIGNS_DATA.filter(c => c.status === 'active');
  const withJourney = CAMPAIGNS_DATA.filter(c => hasCampaignJourney(c.id)).length;
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set('campPulseLive', `${active.length} campaigns live`);
  set('campPulseJourneys', `${withJourney} journeys configured`);
  set('campPulseEngage', '+12% engagement this week');
  set('campPulseCalls', `${Math.round(CAMPAIGNS_DATA.reduce((s, c) => s + c.calls, 0) / 30)} calls avg/day`);

  const spotlight = document.getElementById('campSpotlight');
  if (spotlight) {
    const top = [...CAMPAIGNS_DATA].sort((a, b) => b.progress - a.progress)[0];
    if (top) {
      spotlight.innerHTML = `
        <div class="camp-spotlight-glow" style="--spot-color:${top.color}"></div>
        <div class="camp-spotlight-inner">
          <span class="camp-spotlight-label">Featured campaign</span>
          <h2 class="camp-spotlight-title">${escapeHtml(top.name)}</h2>
          <p class="camp-spotlight-desc">${top.progress}% complete · ${getHcpCount(top).toLocaleString()} HCPs · ${top.rate} engagement</p>
          <div class="camp-spotlight-actions">
            <button type="button" class="camp-btn-primary camp-btn-sm" onclick="viewCampaign(${top.id})">View journey</button>
            <button type="button" class="camp-btn-outline camp-btn-sm" onclick="createJourney(${top.id})">Edit workflow</button>
          </div>
        </div>
        <div class="camp-spotlight-ring" aria-hidden="true">
          <svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="52" fill="none" stroke="rgba(24,169,229,0.12)" stroke-width="8"/>
          <circle cx="60" cy="60" r="52" fill="none" stroke="${top.color}" stroke-width="8" stroke-dasharray="${top.progress * 3.27} 327" stroke-linecap="round" transform="rotate(-90 60 60)"/></svg>
          <span class="camp-spotlight-pct">${top.progress}%</span>
        </div>`;
    }
  }

  const strip = document.getElementById('campChannelStrip');
  if (strip) {
    const channels = [
      { key: 'email', pct: 32, trend: '+4%' },
      { key: 'sms', pct: 24, trend: '+2%' },
      { key: 'whatsapp', pct: 28, trend: '+8%' },
      { key: 'telecall', pct: 16, trend: '-1%' },
    ];
    strip.innerHTML = channels.map(ch => {
      const m = CHANNEL_META[ch.key];
      return `<div class="camp-ch-strip-item">
        <div class="camp-ch-strip-head"><span class="camp-ch-strip-icon" style="background:${m.bg};color:${m.color}">${m.icon}</span>
          <span class="camp-ch-strip-name">${m.label}</span><span class="camp-ch-strip-trend">${ch.trend}</span></div>
        <div class="camp-ch-strip-bar"><div class="camp-ch-strip-fill" style="width:${ch.pct}%;background:${m.color}"></div></div>
        <span class="camp-ch-strip-pct">${ch.pct}% of outreach</span>
      </div>`;
    }).join('');
  }

  const healthScore = document.getElementById('campHealthScore');
  const healthBars = document.getElementById('campHealthBars');
  const journeyPct = Math.round((withJourney / Math.max(CAMPAIGNS_DATA.length, 1)) * 100);
  if (healthScore) healthScore.textContent = `${journeyPct}%`;
  if (healthBars) {
    const metrics = [
      { label: 'Journeys built', val: journeyPct, color: '#18A9E5' },
      { label: 'Active outreach', val: Math.round((active.length / CAMPAIGNS_DATA.length) * 100), color: '#10b981' },
      { label: 'Template coverage', val: 78, color: '#8b5cf6' },
    ];
    healthBars.innerHTML = metrics.map(m => `
      <div class="camp-health-row">
        <div class="camp-health-row-head"><span>${m.label}</span><strong>${m.val}%</strong></div>
        <div class="camp-health-bar"><div class="camp-health-fill" style="width:${m.val}%;background:${m.color}"></div></div>
      </div>`).join('');
  }

  const topList = document.getElementById('campTopList');
  if (topList) {
    const sorted = [...CAMPAIGNS_DATA]
      .filter(c => !isNaN(parseInt(c.rate, 10)))
      .sort((a, b) => parseInt(b.rate, 10) - parseInt(a.rate, 10))
      .slice(0, 4);
    topList.innerHTML = sorted.map((c, i) => `
      <button type="button" class="camp-top-item" onclick="viewCampaign(${c.id})">
        <span class="camp-top-rank">#${i + 1}</span>
        <div class="camp-top-info">
          <strong>${escapeHtml(c.name)}</strong>
          <span>${c.rate} · ${getHcpCount(c).toLocaleString()} HCPs</span>
        </div>
        <span class="camp-top-arrow">→</span>
      </button>`).join('');
  }
}

function initCampCharts() {
  if (typeof Chart === 'undefined') return;
  Object.values(campCharts).forEach(c => c && c.destroy());
  campCharts = {};

  const perfEl = document.getElementById('campPerfChart');
  if (perfEl) {
    campCharts.perf = new Chart(perfEl.getContext('2d'), {
      type: 'line',
      data: {
        labels: ['W1', 'W2', 'W3', 'W4'],
        datasets: [{
          label: 'Engagement %',
          data: [68, 71, 74, 72],
          borderColor: '#18A9E5',
          backgroundColor: 'rgba(24,169,229,0.12)',
          fill: true,
          tension: 0.4,
        }],
      },
      options: chartOpts(false),
    });
  }

  const chEl = document.getElementById('campChannelChart');
  if (chEl) {
    campCharts.channel = new Chart(chEl.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: ['Email', 'SMS', 'WhatsApp', 'Calls'],
        datasets: [{
          data: [32, 24, 28, 16],
          backgroundColor: ['#18A9E5', '#8b5cf6', '#10b981', '#F4C542'],
          borderWidth: 0,
        }],
      },
      options: { ...chartOpts(true), cutout: '65%' },
    });
  }
}

function chartOpts(legend) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: legend, position: 'bottom' } },
    scales: legend ? {} : { y: { beginAtZero: true, max: 100 } },
  };
}

/* Actions */
function viewCampaign(id) {
  const c = CAMPAIGNS_DATA.find(x => x.id === id);
  if (!c) return;
  viewCampaignId = id;
  openCampaignView(c);
}

function openCampaignView(c) {
  const journey = getCampaignJourney(c.id);
  const statusLabel = c.status === 'paused' ? 'Inactive' : c.status.charAt(0).toUpperCase() + c.status.slice(1);

  const header = document.getElementById('campViewHeader');
  if (header) {
    header.innerHTML = `
      <div class="camp-view-hero">
        <div class="camp-view-avatar" style="background:linear-gradient(135deg,${c.color},${adjustBrightness(c.color, -20)})">${c.name.charAt(0)}</div>
        <div>
          <span class="camp-view-eyebrow">${c.type} campaign</span>
          <h2 class="camp-view-title">${escapeHtml(c.name)}</h2>
          <div class="camp-view-tags">
            <span class="status-badge ${c.status}">${statusLabel}</span>
            <span class="camp-view-tag">Start ${c.startDate}</span>
            ${hasCampaignJourney(c.id) ? '<span class="camp-view-tag journey">Journey active</span>' : '<span class="camp-view-tag muted">No journey yet</span>'}
          </div>
        </div>
      </div>
      <button type="button" class="camp-view-close" onclick="closeCampaignView()" aria-label="Close">&times;</button>`;
  }

  const stats = document.getElementById('campViewStats');
  if (stats) {
    stats.innerHTML = `
      <div class="camp-view-stat"><span class="camp-view-stat-val">${getHcpCount(c).toLocaleString()}</span><span class="camp-view-stat-lbl">HCP reach</span></div>
      <div class="camp-view-stat"><span class="camp-view-stat-val">${c.progress}%</span><span class="camp-view-stat-lbl">Progress</span></div>
      <div class="camp-view-stat"><span class="camp-view-stat-val">${c.rate}</span><span class="camp-view-stat-lbl">Engagement</span></div>
      <div class="camp-view-stat"><span class="camp-view-stat-val">${c.calls.toLocaleString()}</span><span class="camp-view-stat-lbl">Calls</span></div>
      <div class="camp-view-stat accent"><span class="camp-view-stat-val">${journey ? journey.length : 0}</span><span class="camp-view-stat-lbl">Journey steps</span></div>`;
  }

  const timeline = document.getElementById('campViewTimeline');
  if (timeline) {
    if (!journey || !journey.length) {
      timeline.innerHTML = `
        <div class="camp-view-empty">
          <div class="camp-view-empty-icon">🛤️</div>
          <h4>No journey configured yet</h4>
          <p>Build an omnichannel workflow with Email, SMS, WhatsApp, conditionals, and reminders.</p>
          <button type="button" class="camp-btn-primary" onclick="closeCampaignView();createJourney(${c.id})">Create journey</button>
        </div>`;
    } else {
      timeline.innerHTML = `
        <div class="camp-view-flow-start">
          <span class="camp-view-flow-start-icon">▶</span>
          <span>Journey start</span>
          <span class="camp-view-flow-audience">${getHcpCount(c).toLocaleString()} HCPs</span>
        </div>
        ${journey.map((step, i) => renderViewStep(step, i, journey.length)).join('')}`;
    }
  }

  const mix = document.getElementById('campViewChannelMix');
  if (mix && journey?.length) {
    const counts = {};
    journey.forEach(s => { counts[s.channel] = (counts[s.channel] || 0) + 1; });
    mix.innerHTML = `
      <h4>Channels in workflow</h4>
      <div class="camp-view-chips">${Object.entries(counts).map(([ch, n]) => {
        const m = CHANNEL_META[ch] || CHANNEL_META.email;
        return `<span class="camp-view-chip" style="background:${m.bg};color:${m.color}">${m.icon} ${m.label} ×${n}</span>`;
      }).join('')}</div>`;
  } else if (mix) mix.innerHTML = '';

  const meta = document.getElementById('campViewMeta');
  if (meta && journey?.length) {
    const totalDays = journey.reduce((s, st) => s + parseInt(st.duration || '0', 10), 0);
    meta.innerHTML = `
      <h4>Journey summary</h4>
      <ul class="camp-view-meta-list">
        <li><strong>Total steps</strong><span>${journey.length}</span></li>
        <li><strong>Est. duration</strong><span>~${totalDays} days</span></li>
        <li><strong>Conditionals</strong><span>${journey.filter(s => s.type === 'conditional').length}</span></li>
        <li><strong>Reminders</strong><span>${journey.filter(s => s.type === 'reminder').length}</span></li>
      </ul>`;
  } else if (meta) meta.innerHTML = '<p class="camp-view-meta-empty">Summary appears after you build a journey.</p>';

  const editBtn = document.getElementById('campViewEditJourney');
  if (editBtn) editBtn.onclick = () => { closeCampaignView(); createJourney(c.id); };

  document.getElementById('campViewOverlay')?.classList.add('show');
  document.body.style.overflow = 'hidden';
}

function renderViewStep(step, index, total) {
  const m = CHANNEL_META[step.channel] || CHANNEL_META.email;
  const typeClass = step.type === 'conditional' ? 'conditional' : step.type === 'reminder' ? 'reminder' : 'channel';
  const typeBadge = step.type === 'conditional' ? 'Conditional' : step.type === 'reminder' ? 'Reminder' : m.label;
  const extra = step.type === 'conditional' && step.condition
    ? `<div class="camp-view-step-extra"><span class="camp-view-step-extra-lbl">Logic</span>${escapeHtml(step.condition)}</div>`
    : step.type === 'reminder' && step.reminder
      ? `<div class="camp-view-step-extra"><span class="camp-view-step-extra-lbl">Reminder</span>${escapeHtml(step.reminder)}</div>`
      : '';
  return `
    <div class="camp-view-step ${typeClass}">
      <div class="camp-view-step-rail">
        <span class="camp-view-step-num">${index + 1}</span>
        ${index < total - 1 ? '<span class="camp-view-step-line"></span>' : ''}
      </div>
      <div class="camp-view-step-card" style="--step-color:${m.color}">
        <div class="camp-view-step-head">
          <span class="camp-view-step-icon" style="background:${m.bg}">${m.icon}</span>
          <div>
            <span class="camp-view-step-type">${typeBadge}</span>
            <h4 class="camp-view-step-title">${escapeHtml(step.template || 'Template not set')}</h4>
          </div>
          <span class="camp-view-step-delay">${durationLabel(step.duration)}</span>
        </div>
        ${step.desc ? `<p class="camp-view-step-desc">${escapeHtml(step.desc)}</p>` : ''}
        ${extra}
      </div>
    </div>`;
}

function closeCampaignView() {
  document.getElementById('campViewOverlay')?.classList.remove('show');
  document.body.style.overflow = '';
  viewCampaignId = null;
}

function stopCampaign(id) {
  const c = CAMPAIGNS_DATA.find(x => x.id === id);
  if (!c) return;
  if (confirm(`Stop campaign "${c.name}"?`)) {
    c.status = 'paused';
    renderCampaignTable();
    updateKPIs();
    if (typeof showToast === 'function') showToast('warning', 'Campaign stopped', `"${c.name}" is now inactive.`);
  }
}

function deleteCampaign(id) {
  const c = CAMPAIGNS_DATA.find(x => x.id === id);
  if (!c) return;
  if (confirm(`Delete "${c.name}"? This cannot be undone.`)) {
    const idx = CAMPAIGNS_DATA.findIndex(x => x.id === id);
    CAMPAIGNS_DATA.splice(idx, 1);
    const store = loadCampaignJourneys();
    delete store[id];
    saveCampaignJourneys(store);
    renderCampaignTable();
    updateKPIs();
    populateCampEngagement();
    if (typeof showToast === 'function') showToast('info', 'Deleted', `"${c.name}" removed.`);
  }
}

function exportCampaigns() {
  if (typeof showToast === 'function') showToast('success', 'Export started', 'Campaign report will download shortly.');
}

function openFilterDrawer() {
  document.getElementById('campFilterDrawer')?.classList.add('show');
}

function closeFilterDrawer() {
  document.getElementById('campFilterDrawer')?.classList.remove('show');
}

function applyFilters() {
  campaignState.advancedFilters = {
    type: document.getElementById('filterType')?.value || '',
    minHcp: parseInt(document.getElementById('filterMinHcp')?.value || '0', 10) || 0,
    dateFrom: document.getElementById('filterDateFrom')?.value || '',
    dateTo: document.getElementById('filterDateTo')?.value || '',
  };
  campaignState.currentPage = 1;
  renderCampaignTable();
  closeFilterDrawer();
  if (typeof showToast === 'function') showToast('info', 'Filters applied', 'Campaign list updated.');
}

function resetFilters() {
  campaignState.advancedFilters = { type: '', minHcp: 0, dateFrom: '', dateTo: '' };
  ['filterType', 'filterMinHcp', 'filterDateFrom', 'filterDateTo'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  renderCampaignTable();
  closeFilterDrawer();
}

/* Journey builder */
function createJourney(campaignId) {
  openJourneyBuilder(campaignId);
}

function openJourneyBuilder(campaignId) {
  const c = campaignId ? CAMPAIGNS_DATA.find(x => x.id === campaignId) : null;
  journeyState.campaignId = campaignId || null;
  const existing = campaignId ? getCampaignJourney(campaignId) : null;
  journeyState.steps = existing ? existing.map((s, i) => ({ ...s, id: s.id || `step_${i + 1}` })) : [];
  journeyState.selectedStepId = null;
  journeyState.stepCounter = journeyState.steps.length;

  const title = document.getElementById('journeyBuilderTitle');
  const sub = document.getElementById('journeyBuilderSubtitle');
  if (title) title.textContent = c ? `Create Journey — ${c.name}` : 'Create Journey';
  if (sub) sub.textContent = c
    ? `Build omnichannel workflow for ${getHcpCount(c).toLocaleString()} HCPs`
    : 'Design your omnichannel HCP engagement workflow';

  renderJourneyFlow();
  showJourneyConfigEmpty();
  document.getElementById('journeyBuilderOverlay')?.classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeJourneyBuilder() {
  document.getElementById('journeyBuilderOverlay')?.classList.remove('show');
  document.body.style.overflow = '';
}

function addJourneyStep(type, channel) {
  journeyState.stepCounter += 1;
  const step = {
    id: 'step_' + journeyState.stepCounter,
    type,
    channel: channel || 'email',
    template: '',
    duration: '1',
    condition: '',
    reminder: '',
    desc: '',
  };
  journeyState.steps.push(step);
  renderJourneyFlow();
  selectJourneyStep(step.id);
}

function addJourneyChannel() { addJourneyStep('channel', 'email'); }
function addConditionalChannel() { addJourneyStep('conditional', 'sms'); }
function addReminderChannel() { addJourneyStep('reminder', 'whatsapp'); }

function renderJourneyFlow() {
  const container = document.getElementById('journeyStepsContainer');
  if (!container) return;

  if (!journeyState.steps.length) {
    container.innerHTML = '<p class="journey-flow-hint">Add channels below to build your journey sequence.</p>';
    return;
  }

  container.innerHTML = journeyState.steps.map((s, i) => {
    const labels = { email: 'Email', sms: 'SMS', whatsapp: 'WhatsApp', telecall: 'Telecall' };
    const typeLabel = s.type === 'conditional' ? 'Conditional' : s.type === 'reminder' ? 'Reminder' : labels[s.channel] || 'Channel';
    const active = s.id === journeyState.selectedStepId ? ' active' : '';
    const connector = i > 0 ? '<div class="journey-connector"></div>' : '';
    return `${connector}
      <button type="button" class="journey-node${active}" data-step-id="${s.id}" onclick="selectJourneyStep('${s.id}')">
        <span class="journey-node-num">${i + 1}</span>
        <span class="journey-node-type">${typeLabel}</span>
        <span class="journey-node-meta">${s.template || 'Configure template'}</span>
      </button>`;
  }).join('');
}

function selectJourneyStep(id) {
  journeyState.selectedStepId = id;
  const step = journeyState.steps.find(s => s.id === id);
  if (!step) return;

  renderJourneyFlow();
  document.getElementById('journeyConfigEmpty')?.classList.add('hidden');
  const form = document.getElementById('journeyConfigForm');
  form?.classList.remove('hidden');

  document.getElementById('journeyConfigTitle').textContent =
    step.type === 'conditional' ? 'Conditional channel' : step.type === 'reminder' ? 'Reminder channel' : 'Channel settings';

  document.querySelectorAll('.journey-channel-card').forEach(c => {
    c.classList.toggle('active', c.dataset.channel === step.channel);
  });

  document.getElementById('journeyTemplate').value = step.template || '';
  document.getElementById('journeyDuration').value = step.duration || '1';
  document.getElementById('journeyStepDesc').value = step.desc || '';

  document.getElementById('journeyConditionalFields')?.classList.toggle('hidden', step.type !== 'conditional');
  document.getElementById('journeyReminderFields')?.classList.toggle('hidden', step.type !== 'reminder');
}

function showJourneyConfigEmpty() {
  document.getElementById('journeyConfigEmpty')?.classList.remove('hidden');
  document.getElementById('journeyConfigForm')?.classList.add('hidden');
}

function selectJourneyChannel(channel, btn) {
  document.querySelectorAll('.journey-channel-card').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  const step = journeyState.steps.find(s => s.id === journeyState.selectedStepId);
  if (step) step.channel = channel;
  renderJourneyFlow();
}

function removeSelectedJourneyStep() {
  if (!journeyState.selectedStepId) return;
  journeyState.steps = journeyState.steps.filter(s => s.id !== journeyState.selectedStepId);
  journeyState.selectedStepId = null;
  renderJourneyFlow();
  showJourneyConfigEmpty();
}

function bindJourneyFormChanges() {
  ['journeyTemplate', 'journeyDuration', 'journeyStepDesc', 'journeyCondition', 'journeyReminder'].forEach(id => {
    const el = document.getElementById(id);
    if (el && !el.dataset.bound) {
      el.dataset.bound = '1';
      el.addEventListener('change', syncJourneyFormToStep);
      el.addEventListener('input', syncJourneyFormToStep);
    }
  });
}

function syncJourneyFormToStep() {
  const step = journeyState.steps.find(s => s.id === journeyState.selectedStepId);
  if (!step) return;
  step.template = document.getElementById('journeyTemplate')?.value || '';
  step.duration = document.getElementById('journeyDuration')?.value || '0';
  step.desc = document.getElementById('journeyStepDesc')?.value || '';
  step.condition = document.getElementById('journeyCondition')?.value || '';
  step.reminder = document.getElementById('journeyReminder')?.value || '';
  renderJourneyFlow();
}

function persistCurrentJourney() {
  if (!journeyState.campaignId || !journeyState.steps.length) return false;
  setCampaignJourney(journeyState.campaignId, journeyState.steps);
  renderCampaignTable();
  populateCampEngagement();
  return true;
}

function saveJourneyDraft() {
  if (!journeyState.steps.length) {
    if (typeof showToast === 'function') showToast('warning', 'Add channels', 'Add at least one channel to save.');
    return;
  }
  if (!journeyState.campaignId) {
    if (typeof showToast === 'function') showToast('warning', 'Select campaign', 'Open journey from a campaign row to link it.');
    return;
  }
  persistCurrentJourney();
  if (typeof showToast === 'function') showToast('success', 'Draft saved', 'Journey workflow saved for this campaign.');
}

function submitJourney() {
  if (!journeyState.steps.length) {
    if (typeof showToast === 'function') showToast('warning', 'Add channels', 'Add at least one channel to submit.');
    return;
  }
  if (journeyState.campaignId) persistCurrentJourney();
  closeJourneyBuilder();
  if (typeof showToast === 'function') showToast('success', 'Journey submitted', `${journeyState.steps.length} step(s) scheduled successfully.`);
}

function adjustBrightness(color, percent) {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, Math.max(0, (num >> 16) + amt));
  const G = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amt));
  const B = Math.min(255, Math.max(0, (num & 0xff) + amt));
  return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

document.addEventListener('DOMContentLoaded', () => {
  bindJourneyFormChanges();
  if (document.getElementById('page-campaigns')?.classList.contains('active')) {
    initCampaignsModule();
  }
});

window.initCampaignsModule = initCampaignsModule;
window.filterCampaigns = filterCampaigns;
window.sortCampaigns = sortCampaigns;
window.toggleSelectAll = toggleSelectAll;
window.handleRowSelect = handleRowSelect;
window.goToPage = goToPage;
window.previousPage = previousPage;
window.nextPage = nextPage;
window.changePaginationSize = changePaginationSize;
window.viewCampaign = viewCampaign;
window.createJourney = createJourney;
window.stopCampaign = stopCampaign;
window.deleteCampaign = deleteCampaign;
window.exportCampaigns = exportCampaigns;
window.openFilterDrawer = openFilterDrawer;
window.closeFilterDrawer = closeFilterDrawer;
window.applyFilters = applyFilters;
window.resetFilters = resetFilters;
window.openJourneyBuilder = openJourneyBuilder;
window.closeJourneyBuilder = closeJourneyBuilder;
window.addJourneyChannel = addJourneyChannel;
window.addConditionalChannel = addConditionalChannel;
window.addReminderChannel = addReminderChannel;
window.selectJourneyStep = selectJourneyStep;
window.selectJourneyChannel = selectJourneyChannel;
window.removeSelectedJourneyStep = removeSelectedJourneyStep;
window.saveJourneyDraft = saveJourneyDraft;
window.submitJourney = submitJourney;
window.closeCampaignView = closeCampaignView;
window.openCampaignView = openCampaignView;
