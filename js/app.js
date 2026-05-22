/* =============================================
   VOICE Platform – Application JavaScript
   ============================================= */

'use strict';

// =============================================
// DATA
// =============================================

const CAMPAIGNS_DATA = [
  { id: 1, name: 'Spring Outreach 2025', type: 'Outbound', status: 'active', progress: 72, calls: 8420, rate: '71%', contacts: 11700, startDate: 'May 15', color: '#18A9E5' },
  { id: 2, name: 'Product Demo Invite', type: 'Voice Blast', status: 'active', progress: 45, calls: 3200, rate: '68%', contacts: 7100, startDate: 'May 18', color: '#F4C542' },
  { id: 3, name: 'Q2 Survey Campaign', type: 'Outbound', status: 'scheduled', progress: 0, calls: 0, rate: '—', contacts: 4500, startDate: 'May 28', color: '#8b5cf6' },
  { id: 4, name: 'Customer Winback', type: 'Outbound', status: 'completed', progress: 100, calls: 6840, rate: '74%', contacts: 6840, startDate: 'Apr 20', color: '#10b981' },
  { id: 5, name: 'Event Reminder Blast', type: 'Voice Blast', status: 'completed', progress: 100, calls: 2200, rate: '88%', contacts: 2200, startDate: 'May 1', color: '#10b981' },
  { id: 6, name: 'Re-engagement Drive', type: 'Outbound', status: 'paused', progress: 33, calls: 1540, rate: '61%', contacts: 4700, startDate: 'May 10', color: '#f87171' },
  { id: 7, name: 'Upsell Campaign', type: 'Inbound', status: 'active', progress: 58, calls: 4100, rate: '79%', contacts: 7060, startDate: 'May 12', color: '#18A9E5' },
  { id: 8, name: 'Feedback Collection', type: 'Outbound', status: 'scheduled', progress: 0, calls: 0, rate: '—', contacts: 3800, startDate: 'Jun 2', color: '#8b5cf6' },
];

const CONTACTS_DATA = [
  { id: 1, name: 'Arjun Kumar', initials: 'AK', phone: '+91 98765 43210', status: 'reached', lastContact: 'May 20', tags: ['VIP', 'Sales'] },
  { id: 2, name: 'Priya Sharma', initials: 'PS', phone: '+91 87654 32109', status: 'pending', lastContact: 'May 18', tags: ['Lead'] },
  { id: 3, name: 'Rahul Mehta', initials: 'RM', phone: '+91 76543 21098', status: 'dnc', lastContact: 'May 15', tags: ['DNC'] },
  { id: 4, name: 'Sneha Patel', initials: 'SP', phone: '+91 65432 10987', status: 'reached', lastContact: 'May 21', tags: ['Customer'] },
  { id: 5, name: 'Vikram Singh', initials: 'VS', phone: '+91 54321 09876', status: 'pending', lastContact: 'May 17', tags: ['Prospect'] },
  { id: 6, name: 'Anita Desai', initials: 'AD', phone: '+91 43210 98765', status: 'reached', lastContact: 'May 21', tags: ['VIP'] },
  { id: 7, name: 'Rohit Gupta', initials: 'RG', phone: '+91 32109 87654', status: 'voicemail', lastContact: 'May 19', tags: ['Lead'] },
  { id: 8, name: 'Kavya Nair', initials: 'KN', phone: '+91 21098 76543', status: 'reached', lastContact: 'May 20', tags: ['Customer', 'VIP'] },
  { id: 9, name: 'Deepak Joshi', initials: 'DJ', phone: '+91 10987 65432', status: 'pending', lastContact: 'May 16', tags: ['Prospect'] },
  { id: 10, name: 'Ritu Agarwal', initials: 'RA', phone: '+91 98761 23456', status: 'reached', lastContact: 'May 21', tags: ['Sales'] },
];

const SEGMENTS_DATA = [
  { name: 'All Contacts', count: '5,284', active: true },
  { name: 'VIP Customers', count: '842' },
  { name: 'Active Leads', count: '1,247' },
  { name: 'Prospects', count: '2,105' },
  { name: 'DNC List', count: '91' },
  { name: 'Unsubscribed', count: '234' },
];

const ACTIVITY_DATA = [
  { icon: '📞', bg: 'rgba(24,169,229,0.1)', text: 'Call connected — <b>Arjun Kumar</b>', time: 'Just now' },
  { icon: '✅', bg: 'rgba(16,185,129,0.1)', text: 'Campaign <b>Spring Outreach</b> hit 70%', time: '5 min ago' },
  { icon: '📋', bg: 'rgba(244,197,66,0.12)', text: 'New contact list uploaded — <b>847 contacts</b>', time: '12 min ago' },
  { icon: '🔇', bg: 'rgba(248,113,113,0.1)', text: 'Voicemail left for <b>Rahul Mehta</b>', time: '18 min ago' },
  { icon: '⏰', bg: 'rgba(139,92,246,0.1)', text: '<b>Q2 Survey</b> scheduled for May 28', time: '1 hour ago' },
];

const MESSAGES_DATA = [
  { id: 1, name: 'Arjun Kumar', initials: 'AK', bg: 'linear-gradient(135deg,#18A9E5,#1270a0)', preview: 'Thanks for the callback!', time: '2m', unread: 2 },
  { id: 2, name: 'Priya Sharma', initials: 'PS', bg: 'linear-gradient(135deg,#F4C542,#d4a017)', preview: 'When will the team call?', time: '15m', unread: 0 },
  { id: 3, name: 'Vikram Singh', initials: 'VS', bg: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', preview: 'Interested in the offer', time: '1h', unread: 1 },
  { id: 4, name: 'Sneha Patel', initials: 'SP', bg: 'linear-gradient(135deg,#10b981,#059669)', preview: 'Please remove me from...', time: 'Yesterday', unread: 0 },
  { id: 5, name: 'Rohit Gupta', initials: 'RG', bg: 'linear-gradient(135deg,#f87171,#dc2626)', preview: 'Missed your call, please...', time: 'Yesterday', unread: 0 },
];

const THREAD_DATA = [
  { type: 'outbound', text: 'Hi Arjun, this is VOICE team reaching out. We have an exclusive offer for you!', time: '10:24 AM' },
  { type: 'inbound', text: 'Hey! I got your voicemail. What offer are you talking about?', time: '10:31 AM' },
  { type: 'outbound', text: 'We are offering a 30% discount on our Pro Plan this month only. Interested?', time: '10:32 AM' },
  { type: 'inbound', text: 'That sounds good! Can you send more details?', time: '10:35 AM' },
  { type: 'outbound', text: 'Absolutely! I\'ll send you a brochure. Would you prefer a callback to discuss further?', time: '10:36 AM' },
  { type: 'inbound', text: 'Thanks for the callback! Yes please, let\'s talk tomorrow at 3 PM.', time: '10:40 AM' },
];

const SCRIPTS_DATA = [
  { name: 'Sales Introduction', preview: 'Hello, this is {agent_name} from VOICE. I\'m calling to introduce you to our new voice campaign management platform...', uses: 142, updated: 'May 15' },
  { name: 'Follow-up Call', preview: 'Hi {contact_name}, this is a follow-up call from {company}. We spoke earlier about {topic} and I wanted to check if you had any questions...', uses: 98, updated: 'May 12' },
  { name: 'Appointment Reminder', preview: 'Hello {contact_name}, this is a friendly reminder from {company} about your appointment scheduled for tomorrow...', uses: 64, updated: 'May 10' },
  { name: 'Survey Script', preview: 'Good day {contact_name}. We are conducting a short survey to improve our services. This will only take 2 minutes of your time...', uses: 37, updated: 'May 5' },
  { name: 'Product Demo Invite', preview: 'Hi {contact_name}, we would love to show you our latest product features in a personalized demo. Is now a good time?', uses: 21, updated: 'May 20' },
  { name: 'Winback Campaign', preview: 'Hello {contact_name}, we noticed you haven\'t heard from us in a while. We have exciting new updates and offers...', uses: 55, updated: 'Apr 28' },
];

const RECORDINGS_DATA = [
  { name: 'Arjun Kumar – Call #4821', campaign: 'Spring Outreach', duration: '3:42', date: 'May 21', outcome: 'answered' },
  { name: 'Priya Sharma – Call #4820', campaign: 'Product Demo Invite', duration: '1:15', date: 'May 21', outcome: 'voicemail' },
  { name: 'Rahul Mehta – Call #4819', campaign: 'Spring Outreach', duration: '0:24', date: 'May 21', outcome: 'no-answer' },
  { name: 'Sneha Patel – Call #4818', campaign: 'Upsell Campaign', duration: '5:10', date: 'May 20', outcome: 'answered' },
  { name: 'Vikram Singh – Call #4817', campaign: 'Customer Winback', duration: '2:58', date: 'May 20', outcome: 'answered' },
  { name: 'Anita Desai – Call #4816', campaign: 'Spring Outreach', duration: '4:33', date: 'May 20', outcome: 'answered' },
];

const SCHEDULE_EVENTS = [
  { time: '9:00 AM', name: 'Spring Outreach 2025', meta: '11,700 contacts · Outbound', status: 'active', color: '#18A9E5' },
  { time: '11:00 AM', name: 'Upsell Campaign', meta: '7,060 contacts · Inbound', status: 'active', color: '#10b981' },
  { time: '2:00 PM', name: 'Product Demo Invite', meta: '7,100 contacts · Voice Blast', status: 'active', color: '#F4C542' },
  { time: 'May 28', name: 'Q2 Survey Campaign', meta: '4,500 contacts · Outbound', status: 'scheduled', color: '#8b5cf6' },
  { time: 'Jun 2', name: 'Feedback Collection', meta: '3,800 contacts · Outbound', status: 'scheduled', color: '#8b5cf6' },
];

const TOP_CAMPAIGNS = [
  { name: 'Event Reminder Blast', meta: '2,200 calls · Voice Blast', rate: '88%' },
  { name: 'Upsell Campaign', meta: '4,100 calls · Inbound', rate: '79%' },
  { name: 'Customer Winback', meta: '6,840 calls · Outbound', rate: '74%' },
  { name: 'Spring Outreach', meta: '8,420 calls · Outbound', rate: '71%' },
  { name: 'Product Demo Invite', meta: '3,200 calls · Voice Blast', rate: '68%' },
];

const BAR_DATA = [
  { label: 'May 8', calls: 1840, rate: 65 },
  { label: 'May 9', calls: 2100, rate: 70 },
  { label: 'May 10', calls: 1620, rate: 62 },
  { label: 'May 11', calls: 1900, rate: 68 },
  { label: 'May 12', calls: 2450, rate: 72 },
  { label: 'May 13', calls: 2200, rate: 69 },
  { label: 'May 14', calls: 1750, rate: 64 },
  { label: 'May 15', calls: 2800, rate: 75 },
  { label: 'May 16', calls: 3100, rate: 78 },
  { label: 'May 17', calls: 2900, rate: 74 },
  { label: 'May 18', calls: 2600, rate: 71 },
  { label: 'May 19', calls: 3200, rate: 77 },
  { label: 'May 20', calls: 2950, rate: 73 },
  { label: 'May 21', calls: 3400, rate: 80 },
];

// =============================================
// NAVIGATION
// =============================================

let currentPage = 'dashboard';

const PAGE_TITLES = {
  dashboard: 'Dashboard',
  campaigns: 'My Campaign',
  calendar: 'Calendar',
  resources: 'Resources',
  settings: 'Settings',
};

function navigateTo(page) {
  // Update active nav item
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
    if (item.dataset.page === page) item.classList.add('active');
  });

  // Update pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById('page-' + page);
  if (target) target.classList.add('active');

  // Update breadcrumb
  const breadcrumb = document.getElementById('breadcrumbCurrent');
  if (breadcrumb) {
    breadcrumb.textContent = PAGE_TITLES[page] || page.charAt(0).toUpperCase() + page.slice(1);
  }

  // Close mobile sidebar
  if (window.innerWidth <= 900) {
    closeSidebar();
  }

  currentPage = page;

  if (page === 'dashboard' && typeof initHealthcareDashboard === 'function') {
    setTimeout(initHealthcareDashboard, 80);
  }
  if (page === 'calendar' && typeof initCalendarModule === 'function') {
    setTimeout(initCalendarModule, 50);
  }
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('mobileOverlay');
  sidebar.classList.toggle('open');
  overlay.classList.toggle('show');
}

function closeSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('mobileOverlay');
  sidebar.classList.remove('open');
  overlay.classList.remove('show');
}

// =============================================
// NOTIFICATIONS
// =============================================

function toggleNotifications(e) {
  if (e) e.stopPropagation();
  const panel = document.getElementById('notificationPanel');
  panel.classList.toggle('show');
  // Close when clicking outside
  if (panel.classList.contains('show')) {
    setTimeout(() => {
      document.addEventListener('click', closeNotifPanel);
    }, 10);
  }
}

function closeNotifPanel(e) {
  const panel = document.getElementById('notificationPanel');
  const btn = document.getElementById('notifBtn');
  if (!panel.contains(e.target) && btn && !btn.contains(e.target)) {
    panel.classList.remove('show');
    document.removeEventListener('click', closeNotifPanel);
  }
}

function markAllNotificationsRead() {
  document.querySelectorAll('.notif-item.unread').forEach(item => {
    item.classList.remove('unread');
    const dot = item.querySelector('.notif-dot');
    if (dot) dot.classList.add('muted');
  });
  const badge = document.querySelector('.notif-badge');
  if (badge) {
    badge.textContent = '0';
    badge.style.display = 'none';
  }
  showToast('success', 'Notifications', 'All notifications marked as read.');
}

window.markAllNotificationsRead = markAllNotificationsRead;

// =============================================
// COUNTER ANIMATION
// =============================================

function animateCounters() {
  document.querySelectorAll('.counter').forEach(el => {
    const target = parseInt(el.dataset.target);
    const duration = 1800;
    const start = performance.now();
    const update = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.floor(eased * target);
      el.textContent = value.toLocaleString();
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  });
}

// =============================================
// CANVAS CHART
// =============================================

function drawCallVolumeChart() {
  const canvas = document.getElementById('callVolumeCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const container = canvas.parentElement;
  canvas.width = container.offsetWidth;
  canvas.height = container.offsetHeight;

  const W = canvas.width;
  const H = canvas.height;
  const pad = { top: 20, right: 20, bottom: 30, left: 40 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;

  const calls = BAR_DATA.map(d => d.calls);
  const rates = BAR_DATA.map(d => d.rate);
  const maxCalls = Math.max(...calls) * 1.15;
  const n = calls.length;
  const xStep = chartW / (n - 1);

  ctx.clearRect(0, 0, W, H);

  // Grid lines
  ctx.strokeStyle = 'rgba(0,0,0,0.05)';
  ctx.lineWidth = 1;
  [0, 0.25, 0.5, 0.75, 1].forEach(t => {
    const y = pad.top + chartH * (1 - t);
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(W - pad.right, y);
    ctx.stroke();
    ctx.fillStyle = '#94A3B8';
    ctx.font = '10px Inter';
    ctx.textAlign = 'right';
    ctx.fillText(Math.round(maxCalls * t).toLocaleString(), pad.left - 6, y + 4);
  });

  // Calls area fill
  const grd = ctx.createLinearGradient(0, pad.top, 0, pad.top + chartH);
  grd.addColorStop(0, 'rgba(24,169,229,0.2)');
  grd.addColorStop(1, 'rgba(24,169,229,0)');

  ctx.beginPath();
  calls.forEach((v, i) => {
    const x = pad.left + i * xStep;
    const y = pad.top + chartH * (1 - v / maxCalls);
    if (i === 0) ctx.moveTo(x, y);
    else {
      const px = pad.left + (i - 1) * xStep;
      const py = pad.top + chartH * (1 - calls[i - 1] / maxCalls);
      const cpx = (px + x) / 2;
      ctx.bezierCurveTo(cpx, py, cpx, y, x, y);
    }
  });
  ctx.lineTo(pad.left + (n - 1) * xStep, pad.top + chartH);
  ctx.lineTo(pad.left, pad.top + chartH);
  ctx.closePath();
  ctx.fillStyle = grd;
  ctx.fill();

  // Calls line
  ctx.beginPath();
  ctx.strokeStyle = '#18A9E5';
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round';
  calls.forEach((v, i) => {
    const x = pad.left + i * xStep;
    const y = pad.top + chartH * (1 - v / maxCalls);
    if (i === 0) ctx.moveTo(x, y);
    else {
      const px = pad.left + (i - 1) * xStep;
      const py = pad.top + chartH * (1 - calls[i - 1] / maxCalls);
      const cpx = (px + x) / 2;
      ctx.bezierCurveTo(cpx, py, cpx, y, x, y);
    }
  });
  ctx.stroke();

  // Rate line (dotted)
  const maxRate = 100;
  ctx.beginPath();
  ctx.strokeStyle = '#F4C542';
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 4]);
  rates.forEach((v, i) => {
    const x = pad.left + i * xStep;
    const y = pad.top + chartH * (1 - v / maxRate);
    if (i === 0) ctx.moveTo(x, y);
    else {
      const px = pad.left + (i - 1) * xStep;
      const py = pad.top + chartH * (1 - rates[i - 1] / maxRate);
      const cpx = (px + x) / 2;
      ctx.bezierCurveTo(cpx, py, cpx, y, x, y);
    }
  });
  ctx.stroke();
  ctx.setLineDash([]);

  // Dots
  calls.forEach((v, i) => {
    const x = pad.left + i * xStep;
    const y = pad.top + chartH * (1 - v / maxCalls);
    ctx.beginPath();
    ctx.arc(x, y, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#18A9E5';
    ctx.fill();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  });

  // X labels (every other)
  ctx.fillStyle = '#94A3B8';
  ctx.font = '10px Inter';
  ctx.textAlign = 'center';
  BAR_DATA.forEach((d, i) => {
    if (i % 2 === 0) {
      const x = pad.left + i * xStep;
      ctx.fillText(d.label.slice(4), x, H - 6);
    }
  });
}

// =============================================
// DASHBOARD POPULATION
// =============================================

function populateCampaignTable() {
  const body = document.getElementById('campaignTableBody');
  if (!body) return;
  const top5 = CAMPAIGNS_DATA.slice(0, 5);
  body.innerHTML = top5.map(c => `
    <div class="table-row" onclick="navigateTo('campaigns')">
      <div>
        <div class="table-campaign-name">${c.name}</div>
        <div class="table-campaign-type">${c.type}</div>
      </div>
      <div>
        <span class="status-badge ${c.status}">
          <span class="status-dot"></span>
          ${c.status.charAt(0).toUpperCase() + c.status.slice(1)}
        </span>
      </div>
      <div class="progress-wrap">
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${c.progress}%"></div>
        </div>
        <span class="progress-pct">${c.progress}%</span>
      </div>
      <div style="font-size:13.5px;font-weight:600;">${c.calls.toLocaleString()}</div>
      <div style="font-size:13.5px;font-weight:600;color:var(--primary)">${c.rate}</div>
    </div>
  `).join('');
}

function populateActivityFeed() {
  const feed = document.getElementById('activityFeed');
  if (!feed) return;
  feed.innerHTML = ACTIVITY_DATA.map(a => `
    <div class="activity-item">
      <div class="activity-icon" style="background:${a.bg}">${a.icon}</div>
      <div class="activity-content">
        <p class="activity-text">${a.text}</p>
        <span class="activity-time">${a.time}</span>
      </div>
    </div>
  `).join('');
}

// =============================================
// CAMPAIGNS PAGE
// =============================================

let currentFilter = 'all';

function populateCampaignCards(filter) {
  const grid = document.getElementById('campaignCardsGrid');
  if (!grid) return;
  const data = filter === 'all' ? CAMPAIGNS_DATA : CAMPAIGNS_DATA.filter(c => c.status === filter);

  if (data.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px 0;color:var(--text-tertiary);">No campaigns found</div>`;
    return;
  }

  grid.innerHTML = data.map(c => `
    <div class="campaign-card" style="--card-accent:${c.color}">
      <div class="campaign-card-top">
        <div>
          <div class="campaign-card-name">${c.name}</div>
          <div class="campaign-card-type">${c.type}</div>
        </div>
        <span class="status-badge ${c.status}">
          <span class="status-dot"></span>
          ${c.status.charAt(0).toUpperCase() + c.status.slice(1)}
        </span>
      </div>
      <div class="campaign-card-stats">
        <div class="card-stat">
          <span class="card-stat-value">${c.calls.toLocaleString()}</span>
          <span class="card-stat-label">Calls</span>
        </div>
        <div class="card-stat">
          <span class="card-stat-value">${c.rate}</span>
          <span class="card-stat-label">Connect</span>
        </div>
        <div class="card-stat">
          <span class="card-stat-value">${(c.contacts/1000).toFixed(1)}k</span>
          <span class="card-stat-label">Contacts</span>
        </div>
      </div>
      ${c.progress > 0 ? `
      <div class="campaign-card-progress">
        <div style="display:flex;justify-content:space-between;font-size:11.5px;color:var(--text-tertiary);margin-bottom:6px;">
          <span>Progress</span><span>${c.progress}%</span>
        </div>
        <div class="progress-bar" style="height:6px">
          <div class="progress-fill" style="width:${c.progress}%;background:${c.color}"></div>
        </div>
      </div>` : ''}
      <div class="campaign-card-footer">
        <span class="card-date">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          ${c.startDate}
        </span>
        <div class="card-actions">
          <button class="card-action-btn" title="Edit" onclick="event.stopPropagation();showToast('info','Edit Campaign','Opening campaign editor...')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="card-action-btn" title="${c.status === 'active' ? 'Pause' : 'Resume'}" onclick="event.stopPropagation();toggleCampaign(${c.id})">
            ${c.status === 'active'
              ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`
              : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>`
            }
          </button>
          <button class="card-action-btn" title="More" onclick="event.stopPropagation()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function filterCampaigns(filter, btn) {
  currentFilter = filter;
  document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  populateCampaignCards(filter);
}

function toggleCampaign(id) {
  const c = CAMPAIGNS_DATA.find(x => x.id === id);
  if (!c) return;
  if (c.status === 'active') {
    c.status = 'paused';
    showToast('warning', 'Campaign Paused', `"${c.name}" has been paused`);
  } else if (c.status === 'paused') {
    c.status = 'active';
    showToast('success', 'Campaign Resumed', `"${c.name}" is now active`);
  }
  populateCampaignCards(currentFilter);
}

// =============================================
// CONTACTS PAGE
// =============================================

function populateSegments() {
  const list = document.getElementById('segmentList');
  if (!list) return;
  list.innerHTML = SEGMENTS_DATA.map(s => `
    <div class="segment-item ${s.active ? 'active' : ''}" onclick="selectSegment(this)">
      <span>${s.name}</span>
      <span class="segment-count">${s.count}</span>
    </div>
  `).join('');
}

function selectSegment(el) {
  document.querySelectorAll('.segment-item').forEach(i => i.classList.remove('active'));
  el.classList.add('active');
}

function populateContacts() {
  const body = document.getElementById('contactsTableBody');
  if (!body) return;

  const statusMap = {
    reached: { label: 'Reached', class: 'active' },
    pending: { label: 'Pending', class: 'scheduled' },
    dnc: { label: 'DNC', class: 'paused' },
    voicemail: { label: 'Voicemail', class: 'completed' },
  };

  body.innerHTML = CONTACTS_DATA.map(c => {
    const s = statusMap[c.status];
    return `
      <tr>
        <td><input type="checkbox" class="table-checkbox" /></td>
        <td>
          <div class="contact-name-cell">
            <div class="contact-mini-avatar">${c.initials}</div>
            <span style="font-weight:600">${c.name}</span>
          </div>
        </td>
        <td style="color:var(--text-secondary)">${c.phone}</td>
        <td><span class="status-badge ${s.class}">${s.label}</span></td>
        <td style="color:var(--text-secondary)">${c.lastContact}</td>
        <td>${c.tags.map(t => `<span class="contact-tag">${t}</span>`).join('')}</td>
        <td>
          <div class="row-actions">
            <button class="row-action" title="Call">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013 5.18a2 2 0 012-2.18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L9.09 10.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
            </button>
            <button class="row-action" title="Message" onclick="navigateTo('messages')">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
            </button>
            <button class="row-action" title="More">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// =============================================
// ANALYTICS PAGE
// =============================================

function populateBarChart() {
  const barsEl = document.getElementById('performanceChart');
  if (!barsEl) return;
  const barsContainer = barsEl.querySelector('.bar-chart-bars');
  const labelsContainer = barsEl.querySelector('.bar-chart-labels');
  if (!barsContainer || !labelsContainer) return;

  const maxCalls = Math.max(...BAR_DATA.map(d => d.calls));

  barsContainer.innerHTML = BAR_DATA.map((d, i) => {
    const h1 = (d.calls / maxCalls * 100);
    const h2 = (d.rate / 100 * 100);
    return `
      <div class="bar-group">
        <div class="bar" style="height:${h1}%;background:rgba(24,169,229,0.8)" data-val="${d.calls.toLocaleString()}"></div>
        <div class="bar" style="height:${h2}%;background:rgba(244,197,66,0.8)" data-val="${d.rate}%"></div>
      </div>
    `;
  }).join('');

  labelsContainer.innerHTML = BAR_DATA.map(d => `<div class="bar-label">${d.label.slice(4)}</div>`).join('');
}

function populateTopCampaigns() {
  const el = document.getElementById('topCampaignsList');
  if (!el) return;
  el.innerHTML = TOP_CAMPAIGNS.map((c, i) => `
    <div class="top-camp-item">
      <span class="top-camp-rank">${String(i + 1).padStart(2, '0')}</span>
      <div class="top-camp-info">
        <div class="top-camp-name">${c.name}</div>
        <div class="top-camp-meta">${c.meta}</div>
      </div>
      <span class="top-camp-rate">${c.rate}</span>
    </div>
  `).join('');
}

function populateHeatmap() {
  const el = document.getElementById('callHeatmap');
  if (!el) return;
  const hours = ['8AM', '9', '10', '11', '12', '1PM', '2', '3', '4', '5', '6', '7PM'];
  const intensities = [0.15, 0.7, 0.85, 0.9, 0.6, 0.75, 0.8, 0.95, 0.88, 0.7, 0.4, 0.2];

  el.innerHTML = hours.map((h, i) => {
    const op = intensities[i];
    return `<div class="heatmap-cell" style="background:rgba(24,169,229,${op})" data-hour="${h}" title="${h}: ${Math.round(op * 100)}% activity"></div>`;
  }).join('');
}

// =============================================
// MESSAGES PAGE
// =============================================

function populateMessages() {
  const list = document.getElementById('msgList');
  if (!list) return;
  list.innerHTML = MESSAGES_DATA.map((m, i) => `
    <div class="msg-list-item ${i === 0 ? 'active' : ''}" onclick="selectMessage(this)">
      <div class="msg-list-avatar" style="background:${m.bg}">${m.initials}</div>
      <div class="msg-list-info">
        <div class="msg-list-name">${m.name}</div>
        <div class="msg-list-preview">${m.preview}</div>
      </div>
      <div class="msg-list-meta">
        <div class="msg-list-time">${m.time}</div>
        ${m.unread ? `<div class="msg-unread-count">${m.unread}</div>` : ''}
      </div>
    </div>
  `).join('');
}

function selectMessage(el) {
  document.querySelectorAll('.msg-list-item').forEach(i => i.classList.remove('active'));
  el.classList.add('active');
}

function populateMsgThread() {
  const thread = document.getElementById('msgThread');
  if (!thread) return;
  thread.innerHTML = THREAD_DATA.map(m => `
    <div class="msg-bubble-wrap ${m.type}">
      <div class="msg-bubble">${m.text}</div>
      <span class="msg-time">${m.time}</span>
    </div>
  `).join('');
  thread.scrollTop = thread.scrollHeight;
}

function sendMessage() {
  const textarea = document.getElementById('msgTextarea');
  const thread = document.getElementById('msgThread');
  const text = textarea.value.trim();
  if (!text) return;

  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble-wrap outbound';
  bubble.innerHTML = `<div class="msg-bubble">${text}</div><span class="msg-time">Just now</span>`;
  thread.appendChild(bubble);
  thread.scrollTop = thread.scrollHeight;
  textarea.value = '';
  document.getElementById('msgCharCount').textContent = '0/160';
  showToast('success', 'Message Sent', 'Your message was delivered successfully');
}

// =============================================
// SCRIPTS PAGE
// =============================================

function populateScripts() {
  const grid = document.getElementById('scriptsGrid');
  if (!grid) return;
  grid.innerHTML = SCRIPTS_DATA.map(s => `
    <div class="script-card">
      <div class="script-card-top">
        <div class="script-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
        </div>
        <button class="card-action-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
        </button>
      </div>
      <div class="script-card-name">${s.name}</div>
      <div class="script-card-preview">${s.preview}</div>
      <div class="script-card-footer">
        <span class="script-last-used">Used ${s.uses} times · ${s.updated}</span>
        <button class="btn-text" style="font-size:12px;">Use →</button>
      </div>
    </div>
  `).join('');
}

function showScriptModal() {
  showToast('info', 'Script Editor', 'Opening script editor...');
}

// =============================================
// RECORDINGS PAGE
// =============================================

function populateRecordings() {
  const list = document.getElementById('recordingsList');
  if (!list) return;
  list.innerHTML = RECORDINGS_DATA.map((r, i) => {
    const waveHeights = Array.from({ length: 20 }, () => 20 + Math.random() * 60);
    return `
      <div class="recording-card">
        <button class="rec-play-btn" onclick="playRecording(${i})">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        </button>
        <div class="rec-info">
          <div class="rec-name">${r.name}</div>
          <div class="rec-meta">${r.campaign} · ${r.date} · 
            <span class="status-badge ${r.outcome === 'answered' ? 'active' : r.outcome === 'voicemail' ? 'completed' : 'paused'}" style="font-size:10px;padding:2px 6px">
              ${r.outcome}
            </span>
          </div>
        </div>
        <div class="rec-waveform">
          ${waveHeights.map(h => `<div class="waveform-bar" style="height:${h}%"></div>`).join('')}
        </div>
        <span class="rec-duration">${r.duration}</span>
      </div>
    `;
  }).join('');
}

let playingRec = null;

function playRecording(idx) {
  showToast('info', 'Playing Recording', `Playing: ${RECORDINGS_DATA[idx].name}`);
}

// =============================================
// RESOURCES PAGE
// =============================================

const RESOURCES_DATA = [
  { name: 'HCP Engagement Playbook', type: 'Guide', desc: 'Best practices for omnichannel HCP outreach and journey design.', icon: '📘', color: '#18A9E5' },
  { name: 'Email Template Library', type: 'Templates', desc: 'Pre-approved email layouts for product launches and follow-ups.', icon: '✉️', color: '#4CC0FF' },
  { name: 'Journey Blueprint Pack', type: 'Journeys', desc: 'Ready-to-use onboarding, sample request, and win-back flows.', icon: '🛤️', color: '#8b5cf6' },
  { name: 'Compliance Checklist', type: 'Compliance', desc: 'Regional guidelines for telecalls, SMS, and WhatsApp outreach.', icon: '✓', color: '#10b981' },
  { name: 'Campaign Brief Template', type: 'Templates', desc: 'Standard brief format for field and inside sales alignment.', icon: '📋', color: '#F4C542' },
  { name: 'Analytics Glossary', type: 'Reference', desc: 'Definitions for KPIs, engagement score, and journey metrics.', icon: '📊', color: '#18A9E5' },
];

function populateResources() {
  const grid = document.getElementById('resourcesGrid');
  if (!grid) return;
  grid.innerHTML = RESOURCES_DATA.map(r => `
    <div class="resource-card" style="--res-color:${r.color}">
      <div class="resource-icon">${r.icon}</div>
      <span class="resource-type">${r.type}</span>
      <h3 class="resource-name">${r.name}</h3>
      <p class="resource-desc">${r.desc}</p>
      <button type="button" class="btn-text resource-open" onclick="showToast('info','Resources','Opening ${r.name.replace(/'/g, '')}…')">Open resource →</button>
    </div>
  `).join('');
}

// =============================================
// CALENDAR PAGE
// =============================================

function populateCalendar() {
  const el = document.getElementById('miniCalendar');
  if (!el) return;

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = today.toLocaleString('default', { month: 'long' });
  const eventDays = [21, 22, 23, 28];

  let html = `
    <div class="cal-header">
      <button class="cal-nav">←</button>
      <span class="cal-title">${monthName} ${year}</span>
      <button class="cal-nav">→</button>
    </div>
    <div class="cal-days-header">
      ${['S','M','T','W','T','F','S'].map(d => `<div class="cal-day-header">${d}</div>`).join('')}
    </div>
    <div class="cal-grid">
  `;

  for (let i = 0; i < firstDay; i++) {
    html += `<div class="cal-day other-month">${new Date(year, month, -firstDay + i + 1).getDate()}</div>`;
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = d === today.getDate();
    const hasEvent = eventDays.includes(d);
    html += `<div class="cal-day ${isToday ? 'today' : ''} ${hasEvent ? 'has-event' : ''}">${d}</div>`;
  }

  html += '</div>';
  el.innerHTML = html;
}

function populateScheduleEvents() {
  const el = document.getElementById('scheduleEvents');
  if (!el) return;

  el.innerHTML = `
    <div class="schedule-date-header">Today — May 21, 2025</div>
    ${SCHEDULE_EVENTS.filter(e => !e.time.includes('May') && !e.time.includes('Jun')).map(e => `
      <div class="schedule-event" style="--event-color:${e.color}">
        <span class="event-time">${e.time}</span>
        <div class="event-info">
          <div class="event-name">${e.name}</div>
          <div class="event-meta">${e.meta}</div>
        </div>
        <div class="event-status">
          <span class="status-badge ${e.status}">
            <span class="status-dot"></span>
            ${e.status.charAt(0).toUpperCase() + e.status.slice(1)}
          </span>
        </div>
      </div>
    `).join('')}
    <div class="schedule-date-header" style="margin-top:20px">Upcoming</div>
    ${SCHEDULE_EVENTS.filter(e => e.time.includes('May') || e.time.includes('Jun')).map(e => `
      <div class="schedule-event" style="--event-color:${e.color}">
        <span class="event-time">${e.time}</span>
        <div class="event-info">
          <div class="event-name">${e.name}</div>
          <div class="event-meta">${e.meta}</div>
        </div>
        <div class="event-status">
          <span class="status-badge ${e.status}">
            <span class="status-dot"></span>
            ${e.status.charAt(0).toUpperCase() + e.status.slice(1)}
          </span>
        </div>
      </div>
    `).join('')}
  `;
}

// =============================================
// SETTINGS PAGE
// =============================================

const SETTINGS_CONTENT = {
  profile: `
    <div class="settings-section">
      <div class="settings-section-title">Personal Information</div>
      <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px;">
        <div style="width:60px;height:60px;border-radius:16px;background:linear-gradient(135deg,#18A9E5,#F4C542);display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700;color:white;flex-shrink:0">RB</div>
        <div>
          <div style="font-size:14px;font-weight:700;color:var(--text-primary)">Rithish Barath</div>
          <div style="font-size:13px;color:var(--text-tertiary);margin-top:3px">Admin · VOICE Platform</div>
          <button class="btn-text" style="font-size:12px;margin-top:4px">Change Photo</button>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">First Name</label>
          <input class="form-input" value="Rithish" />
        </div>
        <div class="form-group">
          <label class="form-label">Last Name</label>
          <input class="form-input" value="Barath" />
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Email Address</label>
        <input class="form-input" value="rithish@voice.in" />
      </div>
      <div class="form-group">
        <label class="form-label">Phone Number</label>
        <input class="form-input" value="+91 98000 12345" />
      </div>
      <button class="btn-primary" onclick="showToast('success','Profile Updated','Your changes have been saved')">Save Changes</button>
    </div>
    <div class="settings-section">
      <div class="settings-section-title">Security</div>
      <div class="settings-row">
        <div class="settings-row-info">
          <div class="settings-row-label">Password</div>
          <div class="settings-row-desc">Last changed 90 days ago</div>
        </div>
        <button class="btn-secondary" style="font-size:13px;">Change Password</button>
      </div>
      <div class="settings-row">
        <div class="settings-row-info">
          <div class="settings-row-label">Two-Factor Authentication</div>
          <div class="settings-row-desc">Add an extra layer of security</div>
        </div>
        <div class="toggle-switch" onclick="toggleSwitch(this)"><div class="toggle-knob"></div></div>
      </div>
    </div>
  `,
  team: `
    <div class="settings-section">
      <div class="settings-section-title">Team Members</div>
      ${[
        { name: 'Rithish Barath', role: 'Admin', email: 'rithish@voice.in', initials: 'RB' },
        { name: 'Ananya Krishnan', role: 'Manager', email: 'ananya@voice.in', initials: 'AK' },
        { name: 'Suresh Pillai', role: 'Agent', email: 'suresh@voice.in', initials: 'SP' },
        { name: 'Divya Mohan', role: 'Agent', email: 'divya@voice.in', initials: 'DM' },
      ].map(m => `
        <div class="settings-row">
          <div style="display:flex;align-items:center;gap:10px;flex:1">
            <div style="width:34px;height:34px;border-radius:9px;background:linear-gradient(135deg,var(--primary),var(--accent));display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:white">${m.initials}</div>
            <div>
              <div class="settings-row-label">${m.name}</div>
              <div class="settings-row-desc">${m.email}</div>
            </div>
          </div>
          <span class="status-badge ${m.role === 'Admin' ? 'active' : m.role === 'Manager' ? 'completed' : 'scheduled'}" style="margin-right:12px">${m.role}</span>
          <button class="btn-secondary" style="font-size:12px;padding:5px 12px;">Manage</button>
        </div>
      `).join('')}
      <button class="btn-primary" style="margin-top:12px" onclick="showToast('info','Invite Sent','Team invitation email has been sent')">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Invite Team Member
      </button>
    </div>
  `,
  billing: `
    <div class="settings-section">
      <div class="settings-section-title">Current Plan</div>
      <div style="background:var(--primary-light);border:1.5px solid var(--primary);border-radius:var(--radius-lg);padding:20px;margin-bottom:16px;">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px">
          <div>
            <div style="font-family:'Sora',sans-serif;font-size:20px;font-weight:700;color:var(--primary)">Professional Plan</div>
            <div style="font-size:13px;color:var(--text-secondary);margin-top:4px">25,000 calls/month · Unlimited contacts · Advanced analytics</div>
          </div>
          <div style="text-align:right">
            <div style="font-family:'Sora',sans-serif;font-size:24px;font-weight:700;color:var(--text-primary)">₹8,499<span style="font-size:14px;color:var(--text-tertiary)">/mo</span></div>
            <button class="btn-primary" style="font-size:13px;margin-top:8px">Upgrade to Enterprise</button>
          </div>
        </div>
      </div>
      <div class="settings-row">
        <div class="settings-row-info">
          <div class="settings-row-label">Calls Used This Month</div>
          <div style="margin-top:8px">
            <div class="progress-bar" style="height:8px;background:var(--surface-2)">
              <div class="progress-fill" style="width:99%"></div>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text-tertiary);margin-top:4px">
              <span>24,817 used</span><span>25,000 limit</span>
            </div>
          </div>
        </div>
      </div>
      <div class="settings-row">
        <div class="settings-row-info">
          <div class="settings-row-label">Next Billing Date</div>
          <div class="settings-row-desc">June 1, 2025</div>
        </div>
        <button class="btn-secondary" style="font-size:13px">View Invoice</button>
      </div>
    </div>
  `,
  integrations: `
    <div class="settings-section">
      <div class="settings-section-title">Connected Integrations</div>
      ${[
        { name: 'Salesforce', desc: 'CRM sync & contact management', connected: true, icon: '☁️' },
        { name: 'Zoho CRM', desc: 'Auto-update call logs', connected: false, icon: '🔶' },
        { name: 'HubSpot', desc: 'Marketing automation', connected: true, icon: '🧡' },
        { name: 'Slack', desc: 'Real-time notifications', connected: false, icon: '💬' },
        { name: 'Google Sheets', desc: 'Export reports & data', connected: true, icon: '📊' },
        { name: 'Zapier', desc: '1000+ app automations', connected: false, icon: '⚡' },
      ].map(i => `
        <div class="settings-row">
          <div style="display:flex;align-items:center;gap:10px;flex:1">
            <span style="font-size:22px">${i.icon}</span>
            <div>
              <div class="settings-row-label">${i.name}</div>
              <div class="settings-row-desc">${i.desc}</div>
            </div>
          </div>
          <button class="btn-${i.connected ? 'secondary' : 'primary'}" style="font-size:13px;padding:7px 14px" onclick="showToast('info','Integration','${i.connected ? 'Disconnecting' : 'Connecting'} ${i.name}...')">
            ${i.connected ? 'Disconnect' : 'Connect'}
          </button>
        </div>
      `).join('')}
    </div>
  `,
  notifications: `
    <div class="settings-section">
      <div class="settings-section-title">Email Notifications</div>
      ${[
        { label: 'Campaign Completed', desc: 'Get notified when a campaign finishes', on: true },
        { label: 'Daily Report', desc: 'Receive a daily performance summary', on: true },
        { label: 'Low Credit Warning', desc: 'Alert when call credits drop below 1,000', on: false },
        { label: 'New Contact Imported', desc: 'Notify on successful contact uploads', on: true },
      ].map(n => `
        <div class="settings-row">
          <div class="settings-row-info">
            <div class="settings-row-label">${n.label}</div>
            <div class="settings-row-desc">${n.desc}</div>
          </div>
          <div class="toggle-switch ${n.on ? 'on' : ''}" onclick="toggleSwitch(this)"><div class="toggle-knob"></div></div>
        </div>
      `).join('')}
    </div>
    <div class="settings-section">
      <div class="settings-section-title">Push Notifications</div>
      ${[
        { label: 'Live Call Alerts', desc: 'Instant alerts for connected calls', on: true },
        { label: 'Campaign Milestones', desc: 'Notify at 25%, 50%, 75% progress', on: false },
      ].map(n => `
        <div class="settings-row">
          <div class="settings-row-info">
            <div class="settings-row-label">${n.label}</div>
            <div class="settings-row-desc">${n.desc}</div>
          </div>
          <div class="toggle-switch ${n.on ? 'on' : ''}" onclick="toggleSwitch(this)"><div class="toggle-knob"></div></div>
        </div>
      `).join('')}
    </div>
  `,
};

function switchSettingsTab(tab, btn) {
  document.querySelectorAll('.settings-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const content = document.getElementById('settingsContent');
  if (content) {
    content.innerHTML = SETTINGS_CONTENT[tab] || '';
  }
}

// =============================================
// MODAL
// =============================================

let currentStep = 1;
const totalSteps = 4;

function showNewCampaignModal() {
  currentStep = 1;
  updateModalStep();
  document.getElementById('newCampaignModal').classList.add('show');
  document.body.style.overflow = 'hidden';
}

function hideNewCampaignModal() {
  document.getElementById('newCampaignModal').classList.remove('show');
  document.body.style.overflow = '';
  currentStep = 1;
}

function updateModalStep() {
  for (let i = 1; i <= totalSteps; i++) {
    const stepIndicator = document.getElementById(`step-${i}-indicator`);
    const stepContent = document.getElementById(`modal-step-${i}`);
    if (stepIndicator) {
      stepIndicator.classList.remove('active', 'completed');
      if (i < currentStep) stepIndicator.classList.add('completed');
      if (i === currentStep) stepIndicator.classList.add('active');
    }
    if (stepContent) {
      stepContent.classList.toggle('active', i === currentStep);
    }
  }

  const backBtn = document.getElementById('modalBackBtn');
  const nextBtn = document.getElementById('modalNextBtn');
  if (backBtn) backBtn.style.display = currentStep > 1 ? 'flex' : 'none';
  if (nextBtn) {
    nextBtn.textContent = currentStep === totalSteps ? '🚀 Launch Campaign' : 'Continue →';
  }

  // Update summary
  const nameEl = document.getElementById('campaignName');
  const summaryName = document.getElementById('summaryName');
  if (nameEl && summaryName) summaryName.textContent = nameEl.value || '—';

  const selectedType = document.querySelector('.type-option.selected span');
  const summaryType = document.getElementById('summaryType');
  if (selectedType && summaryType) summaryType.textContent = selectedType.textContent;

  // Populate existing lists in step 2
  const listsEl = document.getElementById('existingLists');
  if (listsEl && currentStep === 2) {
    listsEl.innerHTML = SEGMENTS_DATA.map(s => `
      <div class="existing-list-item" onclick="this.classList.toggle('selected')">
        <span class="existing-list-name">${s.name}</span>
        <span class="existing-list-count">${s.count} contacts</span>
      </div>
    `).join('');
  }
}

function modalNext() {
  if (currentStep < totalSteps) {
    currentStep++;
    updateModalStep();
  } else {
    hideNewCampaignModal();
    showToast('success', 'Campaign Launched! 🚀', 'Your campaign is now active and running');
  }
}

function modalBack() {
  if (currentStep > 1) {
    currentStep--;
    updateModalStep();
  }
}

function selectType(type) {
  document.querySelectorAll('.type-option').forEach(o => o.classList.remove('selected'));
  document.getElementById('type-' + type).classList.add('selected');
}

function toggleSwitch(el) {
  el.classList.toggle('on');
}

function updateCPM(val) {
  const display = document.getElementById('cpmValue');
  if (display) display.textContent = val;
  const slider = document.getElementById('cpmSlider');
  if (slider) {
    const pct = ((val - 1) / (100 - 1)) * 100;
    slider.style.background = `linear-gradient(to right, var(--primary) 0%, var(--primary) ${pct}%, var(--surface-2) ${pct}%, var(--surface-2) 100%)`;
  }
}

// Close modal on overlay click
document.getElementById('newCampaignModal').addEventListener('click', function(e) {
  if (e.target === this) hideNewCampaignModal();
});

// =============================================
// TOAST SYSTEM
// =============================================

const TOAST_ICONS = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️',
};

function showToast(type, title, body) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type || 'info'}`;
  toast.innerHTML = `
    <span class="toast-icon">${TOAST_ICONS[type] || 'ℹ️'}</span>
    <div class="toast-msg">
      <div class="toast-title">${title}</div>
      <div class="toast-body">${body}</div>
    </div>
  `;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('out');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// =============================================
// SEARCH
// =============================================

const searchInput = document.getElementById('searchInput');
if (searchInput) {
  searchInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && searchInput.value.trim()) {
      showToast('info', 'Search', `Searching for "${searchInput.value.trim()}"...`);
    }
  });
}

// Keyboard shortcut Cmd+K / Ctrl+K for search
document.addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    const si = document.getElementById('searchInput');
    if (si) { si.focus(); si.select(); }
  }
  if (e.key === 'Escape') {
    hideNewCampaignModal();
    document.getElementById('notificationPanel').classList.remove('show');
  }
});

// =============================================
// MSG CHAR COUNT
// =============================================

const msgTextarea = document.getElementById('msgTextarea');
if (msgTextarea) {
  msgTextarea.addEventListener('input', () => {
    const count = msgTextarea.value.length;
    const el = document.getElementById('msgCharCount');
    if (el) el.textContent = `${count}/160`;
  });
}

// =============================================
// CONTACT SEARCH
// =============================================

const contactSearch = document.getElementById('contactSearchInput');
if (contactSearch) {
  contactSearch.addEventListener('input', () => {
    const q = contactSearch.value.toLowerCase();
    document.querySelectorAll('#contactsTableBody tr').forEach(row => {
      row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  });
}

// =============================================
// RESIZE HANDLER
// =============================================

window.addEventListener('resize', () => {
  drawCallVolumeChart();
  if (window.innerWidth > 900) closeSidebar();
});

// =============================================
// INIT
// =============================================

function init() {
  // Healthcare CRM dashboard
  if (typeof initHealthcareDashboard === 'function') {
    setTimeout(initHealthcareDashboard, 150);
  }

  // Populate all pages
  populateCampaignCards('all');
  populateSegments();
  populateContacts();
  populateBarChart();
  populateTopCampaigns();
  populateHeatmap();
  populateMessages();
  populateMsgThread();
  populateScripts();
  populateRecordings();
  populateResources();
  if (typeof initCalendarModule === 'function') initCalendarModule();

  // Settings default
  const settingsContent = document.getElementById('settingsContent');
  if (settingsContent) settingsContent.innerHTML = SETTINGS_CONTENT.profile;

  // Welcome toast
  setTimeout(() => {
    showToast('success', 'Welcome back', 'Your dashboard is ready.');
  }, 1000);
}

// Run on DOM ready
document.addEventListener('DOMContentLoaded', init);
