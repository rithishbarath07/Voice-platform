/* VOICE Calendar – Month, Week, Day & Agenda */

'use strict';

const CAL_STORAGE_KEY = 'voice_calendar_events';
const CAL_HOUR_START = 7;
const CAL_HOUR_END = 20;
const CAL_WEEK_SLOT_H = 40;
const CAL_DAY_SLOT_H = 48;
const CAL_WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const CAL_TYPES = {
  campaign: { label: 'Campaign', color: '#18A9E5', tint: 'rgba(24, 169, 229, 0.14)', text: '#0E8BC4' },
  journey: { label: 'Journey', color: '#8b5cf6', tint: 'rgba(139, 92, 246, 0.14)', text: '#6d28d9' },
  telecall: { label: 'Telecall', color: '#10b981', tint: 'rgba(16, 185, 129, 0.14)', text: '#059669' },
  meeting: { label: 'Meeting', color: '#F4C542', tint: 'rgba(244, 197, 66, 0.22)', text: '#B8860B' },
  email: { label: 'Email', color: '#4CC0FF', tint: 'rgba(76, 192, 255, 0.16)', text: '#0284c7' },
  other: { label: 'Other', color: '#64748B', tint: 'rgba(100, 116, 139, 0.12)', text: '#475569' },
};

let calState = {
  viewDate: new Date(),
  selectedDate: new Date(),
  view: 'month',
  filter: 'all',
  editingId: null,
};

let calEvents = [];
let calInitialized = false;

function calFormatDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function calParseDate(str) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function calSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function calMondayIndex(jsDay) {
  return (jsDay + 6) % 7;
}

function calStartOfWeek(date) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() - calMondayIndex(d.getDay()));
  return d;
}

function calGenerateId() {
  return 'evt_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);
}

function escapeHtml(s) {
  const el = document.createElement('div');
  el.textContent = s;
  return el.innerHTML;
}

function calTimeToMinutes(t) {
  if (!t) return CAL_HOUR_START * 60;
  const [h, m] = t.split(':').map(Number);
  return h * 60 + (m || 0);
}

function calLoadEvents() {
  try {
    const raw = localStorage.getItem(CAL_STORAGE_KEY);
    if (raw) {
      calEvents = JSON.parse(raw);
      return;
    }
  } catch (e) { /* ignore */ }
  calEvents = calGetDefaultEvents();
  calSaveEvents();
}

function calSaveEvents() {
  localStorage.setItem(CAL_STORAGE_KEY, JSON.stringify(calEvents));
}

function calGetDefaultEvents() {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const d = now.getDate();
  const pad = n => String(n).padStart(2, '0');
  const today = `${y}-${pad(m + 1)}-${pad(d)}`;

  return [
    { id: calGenerateId(), title: 'Q3 Planning Review', date: today, startTime: '09:00', endTime: '10:30', type: 'meeting', description: 'Video sync with leadership', color: '#F4C542', status: 'active' },
    { id: calGenerateId(), title: 'Spring Outreach 2025', date: today, startTime: '09:00', endTime: '11:00', type: 'campaign', description: 'Outbound voice campaign — 11,700 contacts', color: '#18A9E5', status: 'active' },
    { id: calGenerateId(), title: 'Campaign Launch Brief', date: today, startTime: '11:30', endTime: '12:00', type: 'campaign', description: 'Product demo voice blast', color: '#18A9E5', status: 'scheduled' },
    { id: calGenerateId(), title: 'HCP Follow-up Calls', date: today, startTime: '14:00', endTime: '16:00', type: 'telecall', description: 'Cardiology segment — Mumbai', color: '#10b981', status: 'scheduled' },
    { id: calGenerateId(), title: 'Journey Review', date: `${y}-${pad(m + 1)}-${pad(Math.min(d + 2, 28))}`, startTime: '15:00', endTime: '16:00', type: 'journey', description: 'Onboarding funnel review', color: '#8b5cf6', status: 'scheduled' },
    { id: calGenerateId(), title: 'Q2 Survey Campaign', date: `${y}-${pad(m + 1)}-${pad(Math.min(d + 5, 28))}`, startTime: '10:00', endTime: '12:00', type: 'campaign', description: '4,500 contacts · Outbound', color: '#8b5cf6', status: 'scheduled' },
  ];
}

function calFilteredEvents(list) {
  return list.filter(e => calState.filter === 'all' || e.type === calState.filter);
}

function calGetEventsForDate(dateStr) {
  return calFilteredEvents(calEvents)
    .filter(e => e.date === dateStr)
    .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
}

function calGetEventsInMonth(year, month) {
  return calFilteredEvents(calEvents).filter(e => {
    const d = calParseDate(e.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });
}

function calGetEventsInRange(startStr, endStr) {
  return calFilteredEvents(calEvents).filter(e => e.date >= startStr && e.date <= endStr);
}

function calEventIcon(type) {
  const icons = {
    campaign: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>',
    meeting: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>',
    telecall: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013 5.18a2 2 0 012-2.18h3a2 2 0 012 1.72"/></svg>',
    journey: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="5" cy="6" r="3"/><circle cx="19" cy="18" r="3"/><path d="M8 6h8M8 18h5M14 6l4 12"/></svg>',
    email: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16v16H4z"/><path d="M22 6l-10 7L2 6"/></svg>',
    other: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>',
  };
  return icons[type] || icons.other;
}

function calEventPillHtml(e, maxLen = 0) {
  const meta = CAL_TYPES[e.type] || CAL_TYPES.other;
  const displayTitle = maxLen > 0 && e.title.length > maxLen
    ? e.title.slice(0, maxLen) + '…'
    : e.title;
  const safeAttr = e.title.replace(/"/g, '&quot;');
  return `
    <span class="cal-ev-pill cal-ev-${e.type}" data-id="${e.id}" title="${safeAttr}"
      style="--pill-bg:${meta.tint};--pill-text:${meta.text}">
      <span class="cal-ev-icon">${calEventIcon(e.type)}</span>
      <span class="cal-ev-text">${escapeHtml(displayTitle)}</span>
    </span>`;
}

function calUpdateStats() {
  const now = new Date();
  const weekStart = calStartOfWeek(now);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  const weekStartStr = calFormatDate(weekStart);
  const weekEndStr = calFormatDate(weekEnd);

  const weekEvents = calGetEventsInRange(weekStartStr, weekEndStr);
  const monthEvents = calGetEventsInMonth(now.getFullYear(), now.getMonth());
  const meetingsMonth = monthEvents.filter(e => e.type === 'meeting' || e.type === 'telecall').length;
  const campaigns = calEvents.filter(e => e.type === 'campaign').length;
  const todayCount = calGetEventsForDate(calFormatDate(now)).length;

  const busyDays = new Set(monthEvents.map(e => e.date)).size;
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const focus = Math.min(98, Math.max(62, Math.round(70 + (busyDays / daysInMonth) * 28)));

  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  set('calBadgeMeetings', `${meetingsMonth || monthEvents.length} events this month`);
  set('calBadgeCampaigns', `${campaigns} active campaigns`);
  set('calBadgeFocus', `Focus score: ${focus}%`);
  set('calStatToday', todayCount);
  set('calStatWeek', weekEvents.length);
  set('calStatMonth', monthEvents.length);
  set('calStatCampaigns', campaigns);
  set('calSideToday', todayCount);
  set('calSideWeek', weekEvents.length);
  set('calSideMonth', monthEvents.length);
}

function calGetPeriodTitle() {
  const { view, viewDate, selectedDate } = calState;
  if (view === 'month') {
    return viewDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  }
  if (view === 'week') {
    const start = calStartOfWeek(viewDate);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const opts = { month: 'short', day: 'numeric' };
    return `${start.toLocaleDateString('default', opts)} – ${end.toLocaleDateString('default', { ...opts, year: 'numeric' })}`;
  }
  if (view === 'day') {
    return selectedDate.toLocaleString('default', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  }
  return viewDate.toLocaleString('default', { month: 'long', year: 'numeric' }) + ' · Agenda';
}

function calUpdatePeriodTitle() {
  const el = document.getElementById('calPeriodTitle') || document.getElementById('calMonthTitle');
  if (el) el.textContent = calGetPeriodTitle();
}

function calSelectDate(dateStr) {
  calState.selectedDate = calParseDate(dateStr);
  const sd = calState.selectedDate;
  if (calState.view === 'month') {
    if (sd.getMonth() !== calState.viewDate.getMonth() || sd.getFullYear() !== calState.viewDate.getFullYear()) {
      calState.viewDate = new Date(sd.getFullYear(), sd.getMonth(), 1);
    }
  } else if (calState.view === 'week') {
    calState.viewDate = new Date(sd);
  } else if (calState.view === 'day') {
    calState.viewDate = new Date(sd);
  }
  calRender();
}

function calBindDayCells(container) {
  container.querySelectorAll('.cal-day').forEach(cell => {
    cell.addEventListener('click', e => {
      if (e.target.closest('.cal-add-day-btn') || e.target.closest('.cal-ev-pill')) return;
      calSelectDate(cell.dataset.date);
    });
  });
  container.querySelectorAll('.cal-add-day-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      openCalEventModal(btn.dataset.date);
    });
  });
  container.querySelectorAll('.cal-ev-pill').forEach(pill => {
    pill.addEventListener('click', e => {
      e.stopPropagation();
      const evt = calEvents.find(x => x.id === pill.dataset.id);
      if (evt) openCalEventModal(evt.date, evt);
    });
  });
}

function calRenderMonth() {
  const el = document.getElementById('calViewMonth');
  if (!el) return;

  const { viewDate, selectedDate } = calState;
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstMondayOffset = calMondayIndex(new Date(year, month, 1).getDay());
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();
  const today = new Date();
  const monthEvents = calGetEventsInMonth(year, month);

  let html = `
    <div class="cal-days-header">
      ${CAL_WEEKDAYS.map(d => `<div class="cal-day-header">${d}</div>`).join('')}
    </div>
    <div class="cal-grid">
  `;

  for (let i = 0; i < firstMondayOffset; i++) {
    const dayNum = prevMonthDays - firstMondayOffset + i + 1;
    const prevM = month === 0 ? 11 : month - 1;
    const prevY = month === 0 ? year - 1 : year;
    const dateStr = `${prevY}-${String(prevM + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    html += calRenderDayCell(dayNum, dateStr, true, today, selectedDate, monthEvents);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    html += calRenderDayCell(d, dateStr, false, today, selectedDate, monthEvents);
  }

  const totalCells = firstMondayOffset + daysInMonth;
  const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  for (let i = 1; i <= remaining; i++) {
    const nextM = month === 11 ? 0 : month + 1;
    const nextY = month === 11 ? year + 1 : year;
    const dateStr = `${nextY}-${String(nextM + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    html += calRenderDayCell(i, dateStr, true, today, selectedDate, monthEvents);
  }

  html += '</div>';
  if (monthEvents.length) {
    html += `<div class="cal-month-footer"><span class="cal-month-bar"></span><span>${monthEvents.length} scheduled this month</span></div>`;
  }
  el.innerHTML = html;
  calBindDayCells(el);
}

function calRenderDayCell(dayNum, dateStr, otherMonth, today, selectedDate, monthEvents) {
  const isToday = calSameDay(calParseDate(dateStr), today);
  const isSelected = calSameDay(calParseDate(dateStr), selectedDate);
  const dayEvents = monthEvents.filter(e => e.date === dateStr);
  const pills = dayEvents.slice(0, 2).map(e => calEventPillHtml(e)).join('');
  const more = dayEvents.length > 2 ? `<span class="cal-day-more">+${dayEvents.length - 2}</span>` : '';
  const bar = dayEvents.length ? '<span class="cal-day-indicator"></span>' : '';

  return `
    <div class="cal-day ${otherMonth ? 'other-month' : ''} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}" data-date="${dateStr}">
      <button type="button" class="cal-add-day-btn" data-date="${dateStr}" title="Add event">+</button>
      <span class="cal-day-num">${dayNum}</span>
      <div class="cal-day-events">${pills}${more}</div>
      ${bar}
    </div>
  `;
}

function calRenderWeek() {
  const el = document.getElementById('calViewWeek');
  if (!el) return;

  const weekStart = calStartOfWeek(calState.viewDate);
  const today = new Date();
  const slotH = CAL_WEEK_SLOT_H;
  const totalH = (CAL_HOUR_END - CAL_HOUR_START) * slotH;

  const headH = 56;
  let html = `<div class="cal-week-wrap" style="--slot-h:${slotH}px;--head-h:${headH}px;--total-h:${totalH}px">
    <div class="cal-week-scroll">
      <div class="cal-week-grid">`;

  html += '<div class="cal-week-corner"></div>';
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    const dateStr = calFormatDate(d);
    const isToday = calSameDay(d, today);
    const isSelected = calSameDay(d, calState.selectedDate);
    html += `
      <div class="cal-week-col-head ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}" data-date="${dateStr}">
        <span class="cal-week-dow">${CAL_WEEKDAYS[i]}</span>
        <button type="button" class="cal-week-day-num">${d.getDate()}</button>
      </div>`;
  }

  for (let h = CAL_HOUR_START; h < CAL_HOUR_END; h++) {
    const label = h === 12 ? '12 PM' : h > 12 ? `${h - 12} PM` : `${h} AM`;
    html += `<div class="cal-week-hour">${label}</div>`;
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      const dateStr = calFormatDate(d);
      html += `<div class="cal-week-slot" data-date="${dateStr}" data-hour="${h}"></div>`;
    }
  }

  html += '</div><div class="cal-week-events-layer">';
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    const dateStr = calFormatDate(d);
    const events = calGetEventsForDate(dateStr);
    events.forEach(ev => {
      const startM = calTimeToMinutes(ev.startTime);
      const endM = Math.max(startM + 30, calTimeToMinutes(ev.endTime || ev.startTime));
      const top = ((startM - CAL_HOUR_START * 60) / 60) * slotH;
      const height = Math.max(28, ((endM - startM) / 60) * slotH);
      const meta = CAL_TYPES[ev.type] || CAL_TYPES.other;
      html += `
        <button type="button" class="cal-week-block cal-ev-${ev.type}" data-id="${ev.id}"
          style="top:${top}px;height:${height}px;left:calc(56px + ${i} * ((100% - 56px) / 7) + 4px);width:calc((100% - 56px) / 7 - 8px);--block-bg:${meta.tint};--block-text:${meta.text};--block-accent:${meta.color}">
          <span class="cal-ev-icon">${calEventIcon(ev.type)}</span>
          <span class="cal-week-block-title">${escapeHtml(ev.title)}</span>
          <span class="cal-week-block-time">${ev.startTime || ''}</span>
        </button>`;
    });
  }
  html += '</div></div></div>';

  el.innerHTML = html;

  el.querySelectorAll('.cal-week-col-head').forEach(head => {
    head.addEventListener('click', () => calSelectDate(head.dataset.date));
  });
  el.querySelectorAll('.cal-week-slot').forEach(slot => {
    slot.addEventListener('dblclick', () => {
      const h = String(slot.dataset.hour).padStart(2, '0');
      openCalEventModal(slot.dataset.date);
      setTimeout(() => {
        const start = document.getElementById('calEventStart');
        const end = document.getElementById('calEventEnd');
        if (start) start.value = `${h}:00`;
        if (end) end.value = `${h}:30`;
      }, 50);
    });
  });
  el.querySelectorAll('.cal-week-block').forEach(block => {
    block.addEventListener('click', e => {
      e.stopPropagation();
      const evt = calEvents.find(x => x.id === block.dataset.id);
      if (evt) openCalEventModal(evt.date, evt);
    });
  });
}

function calRenderDay() {
  const el = document.getElementById('calViewDay');
  if (!el) return;

  const d = calState.selectedDate;
  const dateStr = calFormatDate(d);
  const events = calGetEventsForDate(dateStr);
  const slotH = CAL_DAY_SLOT_H;
  const totalH = (CAL_HOUR_END - CAL_HOUR_START) * slotH;
  const isToday = calSameDay(d, new Date());

  let html = `
    <div class="cal-day-header-bar ${isToday ? 'today' : ''}">
      <div>
        <span class="cal-day-header-dow">${d.toLocaleDateString('default', { weekday: 'long' })}</span>
        <span class="cal-day-header-date">${d.toLocaleDateString('default', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
      </div>
      <button type="button" class="cal-day-add-btn" id="calDayAddBtn">+ Add on this day</button>
    </div>
    <div class="cal-day-timeline" style="--slot-h:${slotH}px;--total-h:${totalH}px">
  `;

  for (let h = CAL_HOUR_START; h < CAL_HOUR_END; h++) {
    const label = h === 12 ? '12 PM' : h > 12 ? `${h - 12} PM` : `${h} AM`;
    html += `<div class="cal-day-hour-row"><span class="cal-day-hour-label">${label}</span><div class="cal-day-hour-line"></div></div>`;
  }

  html += '<div class="cal-day-blocks">';
  events.forEach(ev => {
    const startM = calTimeToMinutes(ev.startTime);
    const endM = calTimeToMinutes(ev.endTime || ev.startTime);
    const top = ((startM - CAL_HOUR_START * 60) / 60) * slotH;
    const height = Math.max(48, ((endM - startM) / 60) * slotH);
    const meta = CAL_TYPES[ev.type] || CAL_TYPES.other;
    html += `
      <button type="button" class="cal-day-block cal-ev-${ev.type}" data-id="${ev.id}"
        style="top:${top}px;height:${height}px;--block-bg:${meta.tint};--block-text:${meta.text};--block-accent:${meta.color}">
        <span class="cal-day-block-icon">${calEventIcon(ev.type)}</span>
        <div class="cal-day-block-body">
          <span class="cal-day-block-title">${escapeHtml(ev.title)}</span>
          <span class="cal-day-block-meta">${ev.startTime || ''}${ev.endTime ? ' – ' + ev.endTime : ''} · ${CAL_TYPES[ev.type]?.label || ev.type}</span>
        </div>
      </button>`;
  });
  if (!events.length) {
    html += `<div class="cal-day-empty-overlay"><p>No events scheduled</p><span>Double-click the timeline or use New Event</span></div>`;
  }
  html += '</div></div>';

  el.innerHTML = html;

  document.getElementById('calDayAddBtn')?.addEventListener('click', () => openCalEventModal(dateStr));
  el.querySelectorAll('.cal-day-block').forEach(block => {
    block.addEventListener('click', () => {
      const evt = calEvents.find(x => x.id === block.dataset.id);
      if (evt) openCalEventModal(evt.date, evt);
    });
  });
}

function calRenderAgenda() {
  const el = document.getElementById('calViewAgenda');
  if (!el) return;

  const { viewDate } = calState;
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const events = calGetEventsInMonth(year, month).sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return (a.startTime || '').localeCompare(b.startTime || '');
  });

  if (!events.length) {
    el.innerHTML = `<div class="cal-empty-state"><strong>No events this month</strong><span>Click New Event to schedule anything.</span></div>`;
    return;
  }

  let html = '<div class="cal-agenda-list">';
  let lastDate = '';
  events.forEach(e => {
    if (e.date !== lastDate) {
      lastDate = e.date;
      const label = calParseDate(e.date).toLocaleDateString('default', { weekday: 'long', month: 'short', day: 'numeric' });
      html += `<div class="cal-agenda-group-title">${label}</div>`;
    }
    html += calEventCardHtml(e);
  });
  html += '</div>';
  el.innerHTML = html;
  calBindEventCards(el);
}

function calEventCardHtml(e) {
  const typeLabel = CAL_TYPES[e.type]?.label || e.type;
  const meta = CAL_TYPES[e.type] || CAL_TYPES.other;
  return `
    <div class="cal-event-card" data-id="${e.id}" style="--event-color:${e.color || meta.color}">
      <div class="cal-event-card-accent" style="background:${meta.tint}"></div>
      <div class="cal-event-card-inner">
        <div class="cal-event-card-time">${e.startTime || 'All day'}${e.endTime ? ' – ' + e.endTime : ''}</div>
        <div class="cal-event-card-title">${calEventIcon(e.type)} ${escapeHtml(e.title)}</div>
        <div class="cal-event-card-meta">${typeLabel}${e.description ? ' · ' + escapeHtml(e.description) : ''}</div>
        <div class="cal-event-card-actions">
          <button type="button" class="cal-event-action-btn" data-action="edit" data-id="${e.id}">Edit</button>
          <button type="button" class="cal-event-action-btn danger" data-action="delete" data-id="${e.id}">Delete</button>
        </div>
      </div>
    </div>
  `;
}

function calBindEventCards(container) {
  container.querySelectorAll('.cal-event-card').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('[data-action]')) return;
      const evt = calEvents.find(x => x.id === card.dataset.id);
      if (evt) openCalEventModal(evt.date, evt);
    });
  });
  container.querySelectorAll('[data-action="edit"]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const evt = calEvents.find(x => x.id === btn.dataset.id);
      if (evt) openCalEventModal(evt.date, evt);
    });
  });
  container.querySelectorAll('[data-action="delete"]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      calDeleteEvent(btn.dataset.id);
    });
  });
}

function calRenderSidebar() {
  const dateStr = calFormatDate(calState.selectedDate);
  const events = calGetEventsForDate(dateStr);
  const labelEl = document.getElementById('calSidebarDate');
  const listEl = document.getElementById('calEventsList');

  if (labelEl) {
    labelEl.textContent = calState.selectedDate.toLocaleDateString('default', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    });
  }

  if (!listEl) return;

  if (!events.length) {
    listEl.innerHTML = `
      <div class="cal-empty-state">
        <strong>No events on this day</strong>
        <span>Tap + to add a campaign, journey, call, or meeting.</span>
      </div>`;
    return;
  }

  listEl.innerHTML = events.map(calEventCardHtml).join('');
  calBindEventCards(listEl);

  const upcomingEl = document.getElementById('calUpcomingList');
  if (upcomingEl) {
    const todayStr = calFormatDate(new Date());
    const upcoming = calFilteredEvents(calEvents)
      .filter(e => e.date >= todayStr)
      .sort((a, b) => (a.date + (a.startTime || '')).localeCompare(b.date + (b.startTime || '')))
      .slice(0, 5);

    upcomingEl.innerHTML = upcoming.length
      ? upcoming.map(e => {
          const pd = calParseDate(e.date);
          const meta = CAL_TYPES[e.type] || CAL_TYPES.other;
          return `
            <div class="cal-event-card compact" data-id="${e.id}" style="--event-color:${e.color || meta.color}">
              <div class="cal-event-card-time">${pd.toLocaleDateString('default', { month: 'short', day: 'numeric' })} · ${e.startTime || ''}</div>
              <div class="cal-event-card-title">${escapeHtml(e.title)}</div>
            </div>`;
        }).join('')
      : '<div class="cal-empty-state"><strong>No upcoming events</strong><span>Your schedule is clear ahead.</span></div>';
    calBindEventCards(upcomingEl);
  }
}

function calShowView() {
  const views = ['month', 'week', 'day', 'agenda'];
  views.forEach(v => {
    const panel = document.getElementById('calView' + v.charAt(0).toUpperCase() + v.slice(1));
    if (panel) panel.classList.toggle('active', calState.view === v);
  });
}

function calRender() {
  calUpdateStats();
  calUpdatePeriodTitle();
  calShowView();

  if (calState.view === 'month') calRenderMonth();
  else if (calState.view === 'week') calRenderWeek();
  else if (calState.view === 'day') calRenderDay();
  else if (calState.view === 'agenda') calRenderAgenda();

  calRenderSidebar();
}

function calNavPrev() {
  const { view, viewDate, selectedDate } = calState;
  if (view === 'month') {
    calState.viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
  } else if (view === 'week') {
    const d = new Date(viewDate);
    d.setDate(d.getDate() - 7);
    calState.viewDate = d;
  } else if (view === 'day') {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    calState.selectedDate = d;
    calState.viewDate = d;
  } else {
    calState.viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
  }
  calRender();
}

function calNavNext() {
  const { view, viewDate, selectedDate } = calState;
  if (view === 'month') {
    calState.viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
  } else if (view === 'week') {
    const d = new Date(viewDate);
    d.setDate(d.getDate() + 7);
    calState.viewDate = d;
  } else if (view === 'day') {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    calState.selectedDate = d;
    calState.viewDate = d;
  } else {
    calState.viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
  }
  calRender();
}

function calGoToday() {
  const now = new Date();
  calState.selectedDate = now;
  if (calState.view === 'month') {
    calState.viewDate = new Date(now.getFullYear(), now.getMonth(), 1);
  } else {
    calState.viewDate = new Date(now);
  }
  calRender();
}

function calSetView(view) {
  calState.view = view;
  document.querySelectorAll('.cal-switch-btn, .cal-view-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.view === view);
  });
  if (view === 'day') {
    calState.viewDate = new Date(calState.selectedDate);
  }
  calRender();
}

function calSetFilter(filter) {
  calState.filter = filter;
  document.querySelectorAll('.cal-filter-chip').forEach(c => {
    c.classList.toggle('active', c.dataset.filter === filter);
  });
  calRender();
}

function openCalEventModal(dateStr, existing) {
  const modal = document.getElementById('calEventModal');
  if (!modal) return;

  const isEdit = !!existing;
  calState.editingId = existing?.id || null;

  document.getElementById('calModalTitle').textContent = isEdit ? 'Edit Event' : 'New Event';
  document.getElementById('calModalSubtitle').textContent = isEdit
    ? 'Update your scheduled item'
    : 'Schedule any campaign, journey, or activity — no limits';

  const d = dateStr || calFormatDate(calState.selectedDate);
  document.getElementById('calEventTitle').value = existing?.title || '';
  document.getElementById('calEventDate').value = existing?.date || d;
  document.getElementById('calEventStart').value = existing?.startTime || '09:00';
  document.getElementById('calEventEnd').value = existing?.endTime || '10:00';
  document.getElementById('calEventDesc').value = existing?.description || '';

  const type = existing?.type || 'campaign';
  document.querySelectorAll('.cal-type-option').forEach(opt => {
    opt.classList.toggle('selected', opt.dataset.type === type);
  });

  const color = existing?.color || CAL_TYPES[type]?.color || '#18A9E5';
  document.querySelectorAll('.cal-color-swatch').forEach(sw => {
    sw.classList.toggle('selected', sw.dataset.color === color);
  });

  modal.classList.add('show');
}

function hideCalEventModal() {
  document.getElementById('calEventModal')?.classList.remove('show');
  calState.editingId = null;
}

function calGetFormEvent() {
  const title = document.getElementById('calEventTitle').value.trim();
  const date = document.getElementById('calEventDate').value;
  const startTime = document.getElementById('calEventStart').value;
  const endTime = document.getElementById('calEventEnd').value;
  const description = document.getElementById('calEventDesc').value.trim();
  const typeEl = document.querySelector('.cal-type-option.selected');
  const type = typeEl?.dataset.type || 'other';
  const colorEl = document.querySelector('.cal-color-swatch.selected');
  const color = colorEl?.dataset.color || CAL_TYPES[type]?.color;

  return { title, date, startTime, endTime, description, type, color, status: 'scheduled' };
}

function calSaveEvent() {
  const data = calGetFormEvent();
  if (!data.title) {
    if (typeof showToast === 'function') showToast('warning', 'Title required', 'Please enter an event title.');
    return;
  }
  if (!data.date) {
    if (typeof showToast === 'function') showToast('warning', 'Date required', 'Please pick a date.');
    return;
  }

  if (calState.editingId) {
    const idx = calEvents.findIndex(e => e.id === calState.editingId);
    if (idx >= 0) calEvents[idx] = { ...calEvents[idx], ...data };
    if (typeof showToast === 'function') showToast('success', 'Event updated', `"${data.title}" saved.`);
  } else {
    calEvents.push({ id: calGenerateId(), ...data });
    if (typeof showToast === 'function') showToast('success', 'Event created', `"${data.title}" added to your calendar.`);
  }

  calSaveEvents();
  calState.selectedDate = calParseDate(data.date);
  if (calState.view === 'month') {
    calState.viewDate = new Date(calState.selectedDate.getFullYear(), calState.selectedDate.getMonth(), 1);
  } else {
    calState.viewDate = new Date(calState.selectedDate);
  }
  hideCalEventModal();
  calRender();
}

function calDeleteEvent(id) {
  const evt = calEvents.find(e => e.id === id);
  calEvents = calEvents.filter(e => e.id !== id);
  calSaveEvents();
  if (typeof showToast === 'function') {
    showToast('info', 'Event removed', evt ? `"${evt.title}" deleted.` : 'Event deleted.');
  }
  calRender();
}

function initCalendarModule() {
  if (!document.getElementById('calViewMonth')) return;

  calLoadEvents();
  calState.viewDate = new Date(calState.viewDate.getFullYear(), calState.viewDate.getMonth(), 1);
  calState.selectedDate = new Date();

  if (calInitialized) {
    calRender();
    return;
  }
  calInitialized = true;

  document.getElementById('calNavPrev')?.addEventListener('click', calNavPrev);
  document.getElementById('calNavNext')?.addEventListener('click', calNavNext);
  document.getElementById('calTodayBtn')?.addEventListener('click', calGoToday);
  document.getElementById('calAddEventBtn')?.addEventListener('click', () => openCalEventModal(calFormatDate(calState.selectedDate)));
  document.getElementById('calSidebarAdd')?.addEventListener('click', () => openCalEventModal(calFormatDate(calState.selectedDate)));

  document.querySelectorAll('.cal-switch-btn, .cal-view-tab').forEach(tab => {
    tab.addEventListener('click', () => calSetView(tab.dataset.view));
  });

  document.querySelectorAll('.cal-filter-chip').forEach(chip => {
    chip.addEventListener('click', () => calSetFilter(chip.dataset.filter));
  });

  document.getElementById('calEventSaveBtn')?.addEventListener('click', calSaveEvent);
  document.getElementById('calEventCancelBtn')?.addEventListener('click', hideCalEventModal);
  document.getElementById('calEventModalClose')?.addEventListener('click', hideCalEventModal);

  document.querySelectorAll('.cal-type-option').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.cal-type-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      const c = CAL_TYPES[opt.dataset.type]?.color;
      if (c) {
        document.querySelectorAll('.cal-color-swatch').forEach(sw => {
          sw.classList.toggle('selected', sw.dataset.color === c);
        });
      }
    });
  });

  document.querySelectorAll('.cal-color-swatch').forEach(sw => {
    sw.addEventListener('click', () => {
      document.querySelectorAll('.cal-color-swatch').forEach(s => s.classList.remove('selected'));
      sw.classList.add('selected');
    });
  });

  document.getElementById('calEventModal')?.addEventListener('click', e => {
    if (e.target.id === 'calEventModal') hideCalEventModal();
  });

  calRender();
}

window.initCalendarModule = initCalendarModule;
window.openCalEventModal = openCalEventModal;
