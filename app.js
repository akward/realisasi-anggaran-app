const USERS = [
  { username: 'admin', password: 'admin123', role: 'admin' },
  { username: 'bendahara', password: 'bendahara123', role: 'bendahara' },
  { username: 'operator', password: 'operator123', role: 'operator' },
];
const STORAGE_KEY = 'ra_anggaran_data';
const SESSION_KEY = 'ra_session';
const defaultData = [
  { id: 1, unit: 'Bidang Infrastruktur', program: 'Pembangunan Jalan', anggaran: 500000000, realisasi: 350000000, tahun: 2026 },
  { id: 2, unit: 'Bidang Pendidikan', program: 'Beasiswa', anggaran: 300000000, realisasi: 270000000, tahun: 2026 },
  { id: 3, unit: 'Bidang Kesehatan', program: 'Posyandu', anggaran: 200000000, realisasi: 180000000, tahun: 2026 },
];
function getData() {
  try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) return JSON.parse(raw); } catch (_) {}
  return defaultData.slice();
}
function saveData(data) { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
function getSession() {
  try { const raw = localStorage.getItem(SESSION_KEY); return raw ? JSON.parse(raw) : null; } catch (_) { return null; }
}
function setSession(user) {
  if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  else localStorage.removeItem(SESSION_KEY);
}
function formatRp(n) { return 'Rp ' + Number(n || 0).toLocaleString('id-ID'); }
function escapeHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function renderTable() {
  const container = document.getElementById('table-container');
  if (!container) return;
  const data = getData();
  const session = getSession();
  const loggedIn = Boolean(session);
  let html = '<table><thead><tr><th>No</th><th>Unit</th><th>Program</th><th>Anggaran</th><th>Realisasi</th><th>Capaian</th><th>Tahun</th>';
  if (loggedIn) html += '<th>Aksi</th>';
  html += '</tr></thead><tbody>';
  data.forEach((item, idx) => {
    const pct = item.anggaran ? ((item.realisasi / item.anggaran) * 100) : 0;
    const pctCls = pct >= 80 ? 'pct-ok' : 'pct-low';
    html += '<tr><td>' + (idx + 1) + '</td><td>' + escapeHtml(item.unit || '-') + '</td><td>' + escapeHtml(item.program) + '</td><td>' + formatRp(item.anggaran) + '</td><td>' + formatRp(item.realisasi) + '</td><td class="' + pctCls + '">' + pct.toFixed(1) + '%</td><td>' + item.tahun + '</td>';
    if (loggedIn) html += '<td><button type="button" class="action-btn" data-id="' + item.id + '">Hapus</button></td>';
    html += '</tr>';
  });
  html += '</tbody></table>';
  container.innerHTML = html;
  container.querySelectorAll('.action-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = Number(btn.getAttribute('data-id'));
      saveData(getData().filter((x) => x.id !== id));
      renderTable();
    });
  });
}
function updateAuthUI() {
  const session = getSession();
  const loginBtn = document.getElementById('login-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const formBox = document.getElementById('anggaran-form-container');
  const modal = document.getElementById('login-modal');
  if (session) {
    loginBtn.classList.add('hidden'); logoutBtn.classList.remove('hidden');
    formBox.classList.remove('hidden'); modal.classList.add('hidden');
  } else {
    loginBtn.classList.remove('hidden'); logoutBtn.classList.add('hidden');
    formBox.classList.add('hidden');
  }
  renderTable();
}
document.getElementById('login-btn').addEventListener('click', () => {
  document.getElementById('login-modal').classList.remove('hidden');
  document.getElementById('login-error').classList.add('hidden');
});
document.getElementById('logout-btn').addEventListener('click', () => { setSession(null); updateAuthUI(); });
document.getElementById('login-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const u = document.getElementById('login-username').value.trim();
  const p = document.getElementById('login-password').value;
  const found = USERS.find((x) => x.username === u && x.password === p);
  const err = document.getElementById('login-error');
  if (!found) { err.textContent = 'Username atau password salah.'; err.classList.remove('hidden'); return; }
  setSession({ username: found.username, role: found.role });
  updateAuthUI();
});
document.getElementById('login-modal').addEventListener('click', (e) => {
  if (e.target.id === 'login-modal') e.target.classList.add('hidden');
});
document.getElementById('anggaran-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const data = getData();
  const nextId = data.reduce((m, x) => Math.max(m, x.id || 0), 0) + 1;
  data.push({
    id: nextId,
    unit: document.getElementById('unit').value.trim(),
    program: document.getElementById('program').value.trim(),
    anggaran: Number(document.getElementById('anggaran').value),
    realisasi: Number(document.getElementById('realisasi').value),
    tahun: Number(document.getElementById('tahun').value),
  });
  saveData(data);
  e.target.reset();
  document.getElementById('tahun').value = '2026';
  renderTable();
});
updateAuthUI();
