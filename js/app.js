// ── PAGE NAVIGATION ──
function showPage(id, el) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('page-' + id).classList.add('active');
  if (el) el.classList.add('active');
}

// ── CLOCK ──
function updateClock() {
  const now = new Date();
  let h = now.getHours(), m = now.getMinutes(), s = now.getSeconds();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  document.getElementById('topbar-clock').textContent =
    `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')} ${ampm}`;
}
setInterval(updateClock, 1000);
updateClock();

function setTheme(mode) {
  const isLight = mode === 'light';
  document.body.classList.toggle('light', isLight);
  localStorage.setItem('themeMode', mode);
  const buttonIcon = document.querySelector('#theme-toggle i');
  if (buttonIcon) {
    buttonIcon.className = isLight ? 'fas fa-sun' : 'fas fa-moon';
  }
  document.getElementById('theme-toggle').title = isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode';
}

function toggleTheme() {
  const current = document.body.classList.contains('light') ? 'light' : 'dark';
  setTheme(current === 'light' ? 'dark' : 'light');
}

(function initializeTheme() {
  const savedTheme = localStorage.getItem('themeMode') || 'dark';
  setTheme(savedTheme);
})();

// ── SIMULATED LIVE DATA ──
let csTemp = 4.2, csHum = 68, rfTemp = 2.5, rfHum = 74;

function randomWalk(val, min, max, step) {
  val += (Math.random() - 0.5) * step;
  return Math.max(min, Math.min(max, parseFloat(val.toFixed(1))));
}

function refreshData() {
  csTemp = randomWalk(csTemp, 2.0, 9.5, 0.3);
  csHum  = randomWalk(csHum,  50, 75, 1.5);
  rfTemp = randomWalk(rfTemp, 0.5, 6.0, 0.2);
  rfHum  = randomWalk(rfHum,  55, 80, 1.5);

  // Dashboard
  document.getElementById('cs-temp').textContent = csTemp.toFixed(1) + '°C';
  document.getElementById('cs-hum').textContent  = csHum.toFixed(0) + '%';
  document.getElementById('rf-temp').textContent = rfTemp.toFixed(1) + '°C';

  const rfHumEl = document.getElementById('rf-hum');
  rfHumEl.textContent = rfHum.toFixed(0) + '%';
  rfHumEl.style.color = rfHum > 70 ? 'var(--amber)' : 'var(--purple)';

  // Detail pages
  document.getElementById('cs-detail-temp').textContent = csTemp.toFixed(1) + '°C';
  document.getElementById('cs-detail-hum').textContent  = csHum.toFixed(0) + '%';
  document.getElementById('rf-detail-temp').textContent = rfTemp.toFixed(1) + '°C';

  // Gauge
  const csGaugePct = (csTemp - 0) / 12;
  document.getElementById('cs-gauge-fill').style.strokeDashoffset = 251.2 * (1 - csGaugePct);
  document.getElementById('cs-gauge-num').textContent = csTemp.toFixed(1);
  const csHumPct = csHum / 100;
  document.getElementById('cs-hum-gauge-fill').style.strokeDashoffset = 251.2 * (1 - csHumPct);
  document.getElementById('cs-gauge-hum-num').textContent = csHum.toFixed(0);

  // Bars
  const csTempPct = Math.min(100, Math.round((csTemp / 12) * 100));
  const csHumPct2 = Math.min(100, Math.round(csHum));
  const rfTempPct = Math.min(100, Math.round((rfTemp / 7) * 100));
  const rfHumPct  = Math.min(100, Math.round(rfHum));
  document.getElementById('cs-temp-bar').style.width = csTempPct + '%';
  document.getElementById('cs-temp-pct').textContent = csTempPct + '%';
  document.getElementById('cs-hum-bar').style.width  = csHumPct2 + '%';
  document.getElementById('cs-hum-pct').textContent  = csHumPct2 + '%';
  document.getElementById('rf-temp-bar').style.width = rfTempPct + '%';
  document.getElementById('rf-temp-pct').textContent = rfTempPct + '%';
  document.getElementById('rf-hum-bar').style.width  = rfHumPct + '%';
  document.getElementById('rf-hum-pct').textContent  = rfHumPct + '%';

  // Health banner
  const banner = document.getElementById('health-banner');
  const title  = document.getElementById('health-title');
  const desc   = document.getElementById('health-desc');
  if (csTemp > 8 || rfTemp > 5) {
    banner.className = 'health-banner critical';
    title.textContent = 'CRITICAL — Temperature Exceeded Limit';
    desc.textContent  = `Zone temperature is above safe threshold. Immediate action required.`;
  } else if (csHum > 70 || rfHum > 70) {
    banner.className = 'health-banner warning';
    title.textContent = 'WARNING — Humidity Elevated';
    desc.textContent  = 'Humidity is above threshold (70%). Check door seal or evaporator.';
  } else {
    banner.className = 'health-banner normal';
    title.textContent = 'NORMAL OPERATION — All Parameters Within Safe Limits';
    desc.textContent  = 'Temperature and humidity are within acceptable ranges for both zones.';
  }

  // Update live chart
  updateLiveChart();
  // Add to log
  addLogEntry();
}

// ── LIVE CHART ──
const labels = [];
const csTempData = [], rfTempData = [], csHumData = [], rfHumData = [];
let chartMode = 'temp';

for (let i = 19; i >= 0; i--) {
  const d = new Date(); d.setSeconds(d.getSeconds() - i * 10);
  labels.push(d.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',second:'2-digit'}));
  csTempData.push((4.2 + (Math.random()-0.5)*0.6).toFixed(2));
  rfTempData.push((2.5 + (Math.random()-0.5)*0.4).toFixed(2));
  csHumData.push((68  + (Math.random()-0.5)*3).toFixed(1));
  rfHumData.push((74  + (Math.random()-0.5)*3).toFixed(1));
}

const ctxLive = document.getElementById('liveChart').getContext('2d');
const liveChart = new Chart(ctxLive, {
  type: 'line',
  data: {
    labels,
    datasets: [
      { label: 'CS Temp (°C)', data: csTempData, borderColor: '#00D4FF', backgroundColor: '#00D4FF11', tension: 0.4, pointRadius: 0, borderWidth: 2 },
      { label: 'RF Temp (°C)', data: rfTempData, borderColor: '#7C5CFC', backgroundColor: '#7C5CFC11', tension: 0.4, pointRadius: 0, borderWidth: 2 },
    ]
  },
  options: {
    responsive: true, maintainAspectRatio: false, animation: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { labels: { color: '#7A99C0', font: { family: 'JetBrains Mono', size: 10 }, boxWidth: 12 } },
      tooltip: { backgroundColor: '#111D35', borderColor: '#1E2F50', borderWidth: 1, titleColor: '#E8F4FF', bodyColor: '#7A99C0', titleFont: { family: 'JetBrains Mono' }, bodyFont: { family: 'JetBrains Mono' } }
    },
    scales: {
      x: { grid: { color: '#1E2F50' }, ticks: { color: '#3D5A7A', font: { family: 'JetBrains Mono', size: 9 }, maxTicksLimit: 6 } },
      y: { grid: { color: '#1E2F50' }, ticks: { color: '#7A99C0', font: { family: 'JetBrains Mono', size: 9 } } }
    }
  }
});

function updateLiveChart() {
  const now = new Date();
  labels.push(now.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',second:'2-digit'}));
  csTempData.push(csTemp.toFixed(2));
  rfTempData.push(rfTemp.toFixed(2));
  csHumData.push(csHum.toFixed(1));
  rfHumData.push(rfHum.toFixed(1));
  if (labels.length > 30) { labels.shift(); csTempData.shift(); rfTempData.shift(); csHumData.shift(); rfHumData.shift(); }
  switchChart(chartMode, null);
}

function switchChart(mode, el) {
  chartMode = mode;
  if (el) {
    document.querySelectorAll('.chart-tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
  }
  if (mode === 'temp') {
    liveChart.data.datasets = [
      { label: 'CS Temp (°C)', data: [...csTempData], borderColor: '#00D4FF', backgroundColor: '#00D4FF11', tension: 0.4, pointRadius: 0, borderWidth: 2 },
      { label: 'RF Temp (°C)', data: [...rfTempData], borderColor: '#7C5CFC', backgroundColor: '#7C5CFC11', tension: 0.4, pointRadius: 0, borderWidth: 2 },
    ];
  } else if (mode === 'hum') {
    liveChart.data.datasets = [
      { label: 'CS Humidity (%)', data: [...csHumData], borderColor: '#00E676', backgroundColor: '#00E67611', tension: 0.4, pointRadius: 0, borderWidth: 2 },
      { label: 'RF Humidity (%)', data: [...rfHumData], borderColor: '#FFAA00', backgroundColor: '#FFAA0011', tension: 0.4, pointRadius: 0, borderWidth: 2 },
    ];
  } else {
    liveChart.data.datasets = [
      { label: 'CS Temp', data: [...csTempData], borderColor: '#00D4FF', backgroundColor: 'transparent', tension: 0.4, pointRadius: 0, borderWidth: 2 },
      { label: 'RF Temp', data: [...rfTempData], borderColor: '#7C5CFC', backgroundColor: 'transparent', tension: 0.4, pointRadius: 0, borderWidth: 2 },
      { label: 'CS Hum', data: [...csHumData], borderColor: '#00E676', backgroundColor: 'transparent', tension: 0.4, pointRadius: 0, borderWidth: 1.5, borderDash: [4,2] },
      { label: 'RF Hum', data: [...rfHumData], borderColor: '#FFAA00', backgroundColor: 'transparent', tension: 0.4, pointRadius: 0, borderWidth: 1.5, borderDash: [4,2] },
    ];
  }
  liveChart.data.labels = [...labels];
  liveChart.update('none');
}

// ── COLD STORAGE DETAIL CHART ──
const ctxCS = document.getElementById('csChart').getContext('2d');
new Chart(ctxCS, {
  type: 'line',
  data: {
    labels: Array.from({length: 20}, (_,i) => { const d = new Date(); d.setMinutes(d.getMinutes()-20+i); return d.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'}); }),
    datasets: [
      { label: 'Temperature (°C)', data: Array.from({length:20}, () => +(3.5 + Math.random()*2.5).toFixed(1)), borderColor: '#00D4FF', backgroundColor: '#00D4FF0D', tension: 0.4, pointRadius: 0, borderWidth: 2, fill: true },
      { label: 'Humidity (%)', data: Array.from({length:20}, () => +(60 + Math.random()*12).toFixed(1)), borderColor: '#7C5CFC', backgroundColor: '#7C5CFC0D', tension: 0.4, pointRadius: 0, borderWidth: 2, fill: true, yAxisID: 'y1' },
    ]
  },
  options: {
    responsive:true, maintainAspectRatio:false, animation:false,
    plugins: { legend: { labels: { color:'#7A99C0', font:{family:'JetBrains Mono',size:10}, boxWidth:12 } } },
    scales: {
      x: { grid:{color:'#1E2F50'}, ticks:{color:'#3D5A7A',font:{family:'JetBrains Mono',size:9},maxTicksLimit:6} },
      y: { grid:{color:'#1E2F50'}, ticks:{color:'#00D4FF',font:{family:'JetBrains Mono',size:9}}, title:{display:true,text:'°C',color:'#00D4FF',font:{size:10}} },
      y1: { position:'right', grid:{display:false}, ticks:{color:'#7C5CFC',font:{family:'JetBrains Mono',size:9}}, title:{display:true,text:'% RH',color:'#7C5CFC',font:{size:10}} }
    }
  }
});

// ── REFRIGERATOR DETAIL CHART ──
const ctxRF = document.getElementById('rfChart').getContext('2d');
new Chart(ctxRF, {
  type: 'line',
  data: {
    labels: Array.from({length:20}, (_,i) => { const d = new Date(); d.setMinutes(d.getMinutes()-20+i); return d.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'}); }),
    datasets: [
      { label: 'Temperature (°C)', data: Array.from({length:20}, () => +(2 + Math.random()*2).toFixed(1)), borderColor: '#00D4FF', backgroundColor: '#00D4FF0D', tension: 0.4, pointRadius: 0, borderWidth: 2, fill: true },
      { label: 'Humidity (%)', data: Array.from({length:20}, () => +(68 + Math.random()*10).toFixed(1)), borderColor: '#FFAA00', backgroundColor: '#FFAA000D', tension: 0.4, pointRadius: 0, borderWidth: 2, fill: true, yAxisID: 'y1' },
    ]
  },
  options: {
    responsive:true, maintainAspectRatio:false, animation:false,
    plugins: { legend: { labels: { color:'#7A99C0', font:{family:'JetBrains Mono',size:10}, boxWidth:12 } } },
    scales: {
      x: { grid:{color:'#1E2F50'}, ticks:{color:'#3D5A7A',font:{family:'JetBrains Mono',size:9},maxTicksLimit:6} },
      y: { grid:{color:'#1E2F50'}, ticks:{color:'#00D4FF',font:{family:'JetBrains Mono',size:9}} },
      y1: { position:'right', grid:{display:false}, ticks:{color:'#FFAA00',font:{family:'JetBrains Mono',size:9}} }
    }
  }
});

// ── ANALYTICS CHART ──
const ctxAn = document.getElementById('analyticsChart').getContext('2d');
const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
new Chart(ctxAn, {
  type: 'bar',
  data: {
    labels: days,
    datasets: [
      { label: 'CS Avg Temp (°C)', data: [4.5,4.2,4.8,5.1,4.6,4.3,4.7], backgroundColor: '#00D4FF33', borderColor: '#00D4FF', borderWidth: 1.5, borderRadius: 4 },
      { label: 'RF Avg Temp (°C)', data: [2.8,2.5,2.9,3.1,2.7,2.4,2.8], backgroundColor: '#7C5CFC33', borderColor: '#7C5CFC', borderWidth: 1.5, borderRadius: 4 },
    ]
  },
  options: {
    responsive:true, maintainAspectRatio:false,
    plugins: { legend: { labels: { color:'#7A99C0', font:{family:'JetBrains Mono',size:10}, boxWidth:12 } } },
    scales: {
      x: { grid:{color:'#1E2F50'}, ticks:{color:'#7A99C0',font:{family:'JetBrains Mono',size:10}} },
      y: { grid:{color:'#1E2F50'}, ticks:{color:'#7A99C0',font:{family:'JetBrains Mono',size:10}} }
    }
  }
});

// ── DATA LOGS ──
const logData = [];
function generateLogData() {
  const now = new Date();
  for (let i = 119; i >= 0; i--) {
    const t = new Date(now - i * 10000);
    const dateKey = t.toISOString().split('T')[0];
    const timeLabel = t.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
    const dateLabel = t.toLocaleDateString('en-IN');
    logData.push({
      id: 120 - i,
      ts: `${dateLabel} ${timeLabel}`,
      date: dateKey,
      zone: i % 2 === 0 ? 'Cold Storage' : 'Refrigerator',
      temp: i % 2 === 0 ? (3.5 + Math.random()*2.5).toFixed(2) : (2 + Math.random()*2).toFixed(2),
      hum:  i % 2 === 0 ? (62 + Math.random()*10).toFixed(1) : (68 + Math.random()*8).toFixed(1),
    });
  }
}
generateLogData();

function renderLogs(data) {
  const tbody = document.getElementById('log-tbody');
  const rows = data.slice(-40).reverse();
  tbody.innerHTML = rows.map(r => {
    const t = parseFloat(r.temp), h = parseFloat(r.hum);
    const tWarn = r.zone === 'Cold Storage' ? t > 8 : t > 5;
    const hWarn = h > 70;
    const status = (tWarn || hWarn) ? `<span class="t-warn">⚠ Warning</span>` : `<span class="t-ok">● Normal</span>`;
    return `<tr>
      <td style="color:var(--text-dim)">${String(r.id).padStart(4,'0')}</td>
      <td>${r.ts}</td>
      <td style="color:var(--text-primary)">${r.zone}</td>
      <td class="t-temp ${tWarn?'t-warn':''}">${r.temp}°C</td>
      <td class="t-hum ${hWarn?'t-warn':''}">${r.hum}%</td>
      <td>${status}</td>
    </tr>`;
  }).join('');
  const shown = Math.min(data.length, 40);
  const extra = data.length > 40 ? ` of ${data.length}` : '';
  document.getElementById('log-count').textContent = `Showing ${shown}${extra} records`;
}
renderLogs(logData);

function filterLogs() {
  const q = document.getElementById('log-search').value.toLowerCase();
  const z = document.getElementById('log-zone').value;
  const dateValue = document.getElementById('log-date').value;
  const filtered = logData.filter(r =>
    (z === 'all' || r.zone === z) &&
    (!dateValue || r.date === dateValue) &&
    (r.ts.toLowerCase().includes(q) || r.zone.toLowerCase().includes(q) || r.temp.includes(q) || r.hum.includes(q))
  );
  renderLogs(filtered);
}

function addLogEntry() {
  const now = new Date();
  const dateKey = now.toISOString().split('T')[0];
  const timeLabel = now.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
  const dateLabel = now.toLocaleDateString('en-IN');

  logData.push({
    id: logData.length + 1,
    ts: `${dateLabel} ${timeLabel}`,
    date: dateKey,
    zone: 'Cold Storage',
    temp: csTemp.toFixed(2),
    hum: csHum.toFixed(1)
  });
  logData.push({
    id: logData.length + 1,
    ts: `${dateLabel} ${timeLabel}`,
    date: dateKey,
    zone: 'Refrigerator',
    temp: rfTemp.toFixed(2),
    hum: rfHum.toFixed(1)
  });
  renderLogs(logData);
}

function exportCSV() {
  const rows = ['#,Timestamp,Zone,Temperature (°C),Humidity (%)', ...logData.map(r => `${r.id},${r.ts},${r.zone},${r.temp},${r.hum}`)];
  const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'cold_storage_logs.csv';
  a.click();
}

function clearAlerts() {
  document.getElementById('alert-badge').textContent = '0';
  document.getElementById('notif-dot').style.display = 'none';
  document.getElementById('ov-alert-count').textContent = '0';
  document.getElementById('open-alert-count').textContent = '0';
  document.querySelectorAll('.stat-open').forEach(el => {
    el.textContent = '● Closed';
    el.className = 'stat-closed';
  });
}

// ── AUTO REFRESH ──
setInterval(refreshData, 10000);
refreshData();
