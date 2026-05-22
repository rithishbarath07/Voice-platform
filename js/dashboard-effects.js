/* VOICE Dashboard – Subtle enhancements only */

'use strict';

function populateHcAiPanel() {
  const el = document.getElementById('hcAiInsights');
  if (!el) return;

  const insights = [
    { tag: 'Opportunity', color: 'blue', text: 'South region telecall connect is 23% above average. Consider shifting more field capacity.' },
    { tag: 'Trend', color: 'gold', text: 'WhatsApp engagement grew 18% week-over-week. Expand sample-request flows to Tier-2.' },
    { tag: 'Action', color: 'red', text: '428 HCPs inactive 30+ days in North. Launch a win-back sequence.' },
  ];

  el.innerHTML = insights.map(i => `
    <div class="hc-ai-item">
      <span class="hc-ai-tag ${i.color}">${i.tag}</span>
      <p>${i.text}</p>
    </div>
  `).join('');
}

function initDashboardEffects() {
  populateHcAiPanel();
}

window.initDashboardEffects = initDashboardEffects;
window.populateHcAiPanel = populateHcAiPanel;
