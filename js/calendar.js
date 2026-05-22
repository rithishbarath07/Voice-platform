/* VOICE Calendar – Full scheduling module */

'use strict';

const CAL_STORAGE_KEY = 'voice_calendar_events';
const CAL_TYPES = {
  campaign: { label: 'Campaign', color: '#18A9E5' },
  journey: { label: 'Journey', color: '#8b5cf6' },
  telecall: { label: 'Telecall', color: '#10b981' },
  meeting: { label: 'Meeting', color: '#F4C542' },
  email: { label: 'Email', color: '#4CC0FF' },
  other: { label: 'Other', color: '#64748B' },
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

function calGenerateId() {
  return 'evt_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);
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
    { id: calGenerateId(), title: 'Spring Outreach 2025', date: today, startTime: '09:00', endTime: '11:00', type: 'campaign', description: 'Outbound voice campaign — 11,700 contacts', color: '#18A9E5', status: 'active' },
    { id: calGenerateId(), title: 'Upsell Campaign', date: today, startTime: '11:00', endTime: '12:30', type: 'campaign', description: 'Inbound routing — 7,060 contacts', color: '#10b981', status: 'active' },
    { id: calGenerateId(), title: 'HCP Follow-up Calls', date: today, startTime: '14:00', endTime: '16:00', type: 'telecall', description: 'Cardiology segment — Mumbai', color: '#10b981', status: 'scheduled' },
    { id: calGenerateId(), title: 'Product Demo Invite', date: today, startTime: '16:00', endTime: '17:00', type: 'email', description: 'Voice blast — 7,100 contacts', color: '#4CC0FF', status: 'scheduled' },
    { id: calGenerateId(), title: 'Q2 Survey Campaign', date: `${y}-${pad(m + 1)}-${pad(Math.min(d + 7, 28))}`, startTime: '10:00', endTime: '12:00', type: 'campaign', description: '4,500 contacts · Outbound', color: '#8b5cf6', status: 'scheduled' },
    { id: calGenerateId(), title: 'Journey Review', date: `${y}-${pad(m + 1)}-${pad(Math.min(d + 3, 28))}`, startTime: '15:00', endTime: '16:00', type: 'journey', description: 'Onboarding funnel review', color: '#8b5cf6', status: 'scheduled' },
  ];
}

function calGetEventsForDate(dateStr) {
  return calEvents
    .filter(e => e.date === dateStr)
    .filter(e => calState.filter === 'all' || e.type === calState.filter)
    .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
}

function calGetEventsInMonth(year, month) {
  return calEvents.filter(e => {
    const d = calParseDate(e.date);
    return d.getFullYear() === year && d.getMonth() === month;
  }).filter(e => calState.filter === 'all' || e.type === calState.filter);
}

function calUpdateStats() {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const weekEvents = calEvents.filter(e => {
    const d = calParseDate(e.date);
    return d >= startOfWeek && d <= endOfWeek;
  });

  const monthEvents = calGetEventsInMonth(now.getFullYear(), now.getMonth());
  const campaigns = calEvents.filter(e => e.type === 'campaign').length;
  const todayStr = calFormatDate(now);
  const todayCount = calGetEventsForDate(todayStr).length;

  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  set('calStatWeek', weekEvents.length);
  set('calStatMonth', monthEvents.length);
  set('calStatCampaigns', campaigns);
  set('calStatToday', todayCount);
}

function calRenderMonth() {
  const el = document.getElementById('mainCalendar');
  if (!el) return;

  const { viewDate, selectedDate } = calState;
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();
  const monthName = viewDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const today = new Date();
  const monthEvents = calGetEventsInMonth(year, month);

  let html = `
    <div class="cal-header" style="display:none"></div>
    <div class="cal-days-header">
      ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => `<div class="cal-day-header">${d}</div>`).join('')}
    </div>
    <div class="cal-grid">
  `;

  for (let i = 0; i < firstDay; i++) {
    const dayNum = prevMonthDays - firstDay + i + 1;
    const prevM = month === 0 ? 11 : month - 1;
    const prevY = month === 0 ? year - 1 : year;
    const dateStr = `${prevY}-${String(prevM + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    html += calRenderDayCell(dayNum, dateStr, true, today, selectedDate, monthEvents);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    html += calRenderDayCell(d, dateStr, false, today, selectedDate, monthEvents);
  }

  const totalCells = firstDay + daysInMonth;
  const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  for (let i = 1; i <= remaining; i++) {
    const nextM = month === 11 ? 0 : month + 1;
    const nextY = month === 11 ? year + 1 : year;
    const dateStr = `${nextY}-${String(nextM + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    html += calRenderDayCell(i, dateStr, true, today, selectedDate, monthEvents);
  }

  html += '</div>';
  el.innerHTML = html;

  document.getElementById('calMonthTitle').textContent = monthName;

  el.querySelectorAll('.cal-day').forEach(cell => {
    cell.addEventListener('click', e => {
      if (e.target.closest('.cal-add-day-btn')) return;
      const dateStr = cell.dataset.date;
      calState.selectedDate = calParseDate(dateStr);
      const sd = calState.selectedDate;
      if (sd.getMonth() !== calState.viewDate.getMonth() || sd.getFullYear() !== calState.viewDate.getFullYear()) {
        calState.viewDate = new Date(sd.getFullYear(), sd.getMonth(), 1);
      }
      calRender();
    });
  });

  el.querySelectorAll('.cal-add-day-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      openCalEventModal(btn.dataset.date);
    });
  });

  el.querySelectorAll('.cal-day-event-pill').forEach(pill => {
    pill.addEventListener('click', e => {
      e.stopPropagation();
      const id = pill.dataset.id;
      const evt = calEvents.find(x => x.id === id);
      if (evt) openCalEventModal(evt.date, evt);
    });
  });
}

function calRenderDayCell(dayNum, dateStr, otherMonth, today, selectedDate, monthEvents) {
  const isToday = calSameDay(calParseDate(dateStr), today);
  const isSelected = calSameDay(calParseDate(dateStr), selectedDate);
  const dayEvents = monthEvents.filter(e => e.date === dateStr);
  const pills = dayEvents.slice(0, 2).map(e =>
    `<span class="cal-day-event-pill" data-id="${e.id}" style="background:${e.color || CAL_TYPES[e.type]?.color}">${e.title}</span>`
  ).join('');
  const more = dayEvents.length > 2 ? `<span class="cal-day-more">+${dayEvents.length - 2} more</span>` : '';

  return `
    <div class="cal-day ${otherMonth ? 'other-month' : ''} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}" data-date="${dateStr}">
      <button type="button" class="cal-add-day-btn" data-date="${dateStr}" title="Add event">+</button>
      <span class="cal-day-num">${dayNum}</span>
      <div class="cal-day-events">${pills}${more}</div>
    </div>
  `;
}

function calRenderAgenda() {
  const el = document.getElementById('calAgendaView');
  if (!el) return;

  const { viewDate } = calState;
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const events = calGetEventsInMonth(year, month).sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return (a.startTime || '').localeCompare(b.startTime || '');
  });

  if (!events.length) {
    el.innerHTML = `<div class="cal-empty-state"><strong>No events this month</strong>Click Add Event to schedule anything.</div>`;
    return;
  }

  let html = '';
  let lastDate = '';
  events.forEach(e => {
    if (e.date !== lastDate) {
      lastDate = e.date;
      const label = calParseDate(e.date).toLocaleDateString('default', { weekday: 'long', month: 'short', day: 'numeric' });
      html += `<div class="cal-agenda-group-title">${label}</div>`;
    }
    html += calEventCardHtml(e);
  });
  el.innerHTML = html;
  calBindEventCards(el);
}

function calEventCardHtml(e) {
  const typeLabel = CAL_TYPES[e.type]?.label || e.type;
  return `
    <div class="cal-event-card" data-id="${e.id}" style="--event-color:${e.color || CAL_TYPES[e.type]?.color}">
      <div class="cal-event-card-time">${e.startTime || 'All day'}${e.endTime ? ' – ' + e.endTime : ''}</div>
      <div class="cal-event-card-title">${escapeHtml(e.title)}</div>
      <div class="cal-event-card-meta">${typeLabel}${e.description ? ' · ' + escapeHtml(e.description) : ''}</div>
      <div class="cal-event-card-actions">
        <button type="button" class="cal-event-action-btn" data-action="edit" data-id="${e.id}">Edit</button>
        <button type="button" class="cal-event-action-btn danger" data-action="delete" data-id="${e.id}">Delete</button>
      </div>
    </div>
  `;
}

function escapeHtml(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
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
        Click + to add a campaign, journey, call, or any event.
      </div>`;
    return;
  }

  listEl.innerHTML = events.map(calEventCardHtml).join('');
  calBindEventCards(listEl);

  const upcomingEl = document.getElementById('calUpcomingList');
  if (upcomingEl) {
    const todayStr = calFormatDate(new Date());
    const upcoming = calEvents
      .filter(e => e.date >= todayStr)
      .filter(e => calState.filter === 'all' || e.type === calState.filter)
      .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime))
      .slice(0, 5);

    upcomingEl.innerHTML = upcoming.length
      ? upcoming.map(e => {
          const d = calParseDate(e.date);
          return `
            <div class="cal-event-card" data-id="${e.id}" style="--event-color:${e.color}">
              <div class="cal-event-card-time">${d.toLocaleDateString('default', { month: 'short', day: 'numeric' })} · ${e.startTime || ''}</div>
              <div class="cal-event-card-title">${escapeHtml(e.title)}</div>
            </div>`;
        }).join('')
      : '<div class="cal-empty-state">No upcoming events</div>';
    calBindEventCards(upcomingEl);
  }
}

function calRender() {
  calUpdateStats();
  const monthPanel = document.getElementById('mainCalendar');
  const agendaPanel = document.getElementById('calAgendaView');

  if (calState.view === 'month') {
    if (monthPanel) monthPanel.style.display = '';
    if (agendaPanel) agendaPanel.classList.remove('active');
    calRenderMonth();
  } else if (calState.view === 'agenda') {
    if (monthPanel) monthPanel.style.display = 'none';
    if (agendaPanel) agendaPanel.classList.add('active');
    calRenderAgenda();
  }
  calRenderSidebar();
}

function calPrevMonth() {
  calState.viewDate = new Date(calState.viewDate.getFullYear(), calState.viewDate.getMonth() - 1, 1);
  calRender();
}

function calNextMonth() {
  calState.viewDate = new Date(calState.viewDate.getFullYear(), calState.viewDate.getMonth() + 1, 1);
  calRender();
}

function calGoToday() {
  const now = new Date();
  calState.viewDate = new Date(now.getFullYear(), now.getMonth(), 1);
  calState.selectedDate = now;
  calRender();
}

function calSetView(view) {
  calState.view = view;
  document.querySelectorAll('.cal-view-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.view === view);
  });
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

  document.getElementById('calModalTitle').textContent = isEdit ? 'Edit Event' : 'Add Event';
  document.getElementById('calModalSubtitle').textContent = isEdit ? 'Update your scheduled item' : 'Schedule any campaign, journey, or activity — no limits';

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
  calState.viewDate = new Date(calState.selectedDate.getFullYear(), calState.selectedDate.getMonth(), 1);
  hideCalEventModal();
  calRender();
}

function calDeleteEvent(id) {
  const evt = calEvents.find(e => e.id === id);
  calEvents = calEvents.filter(e => e.id !== id);
  calSaveEvents();
  if (typeof showToast === 'function') showToast('info', 'Event removed', evt ? `"${evt.title}" deleted.` : 'Event deleted.');
  calRender();
}

function initCalendarModule() {
  if (!document.getElementById('mainCalendar')) return;

  calLoadEvents();
  calState.viewDate = new Date(calState.viewDate.getFullYear(), calState.viewDate.getMonth(), 1);
  calState.selectedDate = new Date();

  if (calInitialized) {
    calRender();
    return;
  }
  calInitialized = true;

  document.getElementById('calPrevMonth')?.addEventListener('click', calPrevMonth);
  document.getElementById('calNextMonth')?.addEventListener('click', calNextMonth);
  document.getElementById('calTodayBtn')?.addEventListener('click', calGoToday);
  document.getElementById('calAddEventBtn')?.addEventListener('click', () => openCalEventModal(calFormatDate(calState.selectedDate)));
  document.getElementById('calSidebarAdd')?.addEventListener('click', () => openCalEventModal(calFormatDate(calState.selectedDate)));

  document.querySelectorAll('.cal-view-tab').forEach(tab => {
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
