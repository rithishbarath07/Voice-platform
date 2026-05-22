/* VOICE Dashboard – Subtle UI enhancements */

'use strict';

function populateHcAiPanel() {
  const el = document.getElementById('hcAiInsights');
  if (!el) return;

  const insights = [
    { tag: 'Opportunity', color: 'blue', icon: '↑', text: 'South region telecall connect is 23% above average. Consider shifting more field capacity.' },
    { tag: 'Trend', color: 'gold', icon: '◆', text: 'WhatsApp engagement grew 18% week-over-week. Expand sample-request flows to Tier-2.' },
    { tag: 'Action', color: 'red', icon: '!', text: '428 HCPs inactive 30+ days in North. Launch a win-back sequence this week.' },
  ];

  el.innerHTML = insights.map(i => `
    <div class="hc-ai-item">
      <div class="hc-ai-item-head">
        <span class="hc-ai-tag ${i.color}">${i.tag}</span>
        <span class="hc-ai-icon-mark">${i.icon}</span>
      </div>
      <p>${i.text}</p>
    </div>
  `).join('');
}

function initDashboardEffects() {
  populateHcAiPanel();
}

window.initDashboardEffects = initDashboardEffects;
window.populateHcAiPanel = populateHcAiPanel;
