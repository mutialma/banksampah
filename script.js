// ==================== DATA STORE ====================
const DB = {
  currentUser: null,
  currentRole: 'admin',

  admin: { username: 'admin', password: 'admin123', name: 'Administrator', email: 'admin@ecobank.id' },

  nasabah: [
    { id: 'N001', name: 'Siti Rahayu', alamat: 'Jl. Merdeka No. 12, Jakarta', hp: '081234567890', saldo: 125000 },
    { id: 'N002', name: 'Budi Santoso', alamat: 'Jl. Pahlawan No. 5, Bandung', hp: '085678901234', saldo: 78500 },
    { id: 'N003', name: 'Dewi Kusuma', alamat: 'Jl. Kenanga No. 8, Surabaya', hp: '087890123456', saldo: 210000 },
    { id: 'N004', name: 'Ahmad Fauzi', alamat: 'Jl. Anggrek No. 20, Yogyakarta', hp: '082345678901', saldo: 45000 },
  ],
  users: [
    { username: 'siti', password: 'siti123', nasabahId: 'N001' },
    { username: 'budi', password: 'budi123', nasabahId: 'N002' },
    { username: 'dewi', password: 'dewi123', nasabahId: 'N003' },
    { username: 'ahmad', password: 'ahmad123', nasabahId: 'N004' },
  ],

  jenisSampah: [
    { id: 'S001', jenis: 'Botol Plastik', harga: 3000 },
    { id: 'S002', jenis: 'Kertas/Kardus', harga: 1500 },
    { id: 'S003', jenis: 'Kaleng Aluminium', harga: 8000 },
    { id: 'S004', jenis: 'Besi/Logam', harga: 5000 },
    { id: 'S005', jenis: 'Kaca/Botol Kaca', harga: 1000 },
  ],

  setoran: [
    { id: 'SET001', tanggal: '2025-01-10', nasabahId: 'N001', jenisSampahId: 'S001', berat: 5, hargaPerKg: 3000, total: 15000 },
    { id: 'SET002', tanggal: '2025-01-15', nasabahId: 'N002', jenisSampahId: 'S002', berat: 8, hargaPerKg: 1500, total: 12000 },
    { id: 'SET003', tanggal: '2025-01-20', nasabahId: 'N003', jenisSampahId: 'S003', berat: 3, hargaPerKg: 8000, total: 24000 },
    { id: 'SET004', tanggal: '2025-02-05', nasabahId: 'N001', jenisSampahId: 'S004', berat: 10, hargaPerKg: 5000, total: 50000 },
    { id: 'SET005', tanggal: '2025-02-12', nasabahId: 'N004', jenisSampahId: 'S001', berat: 4, hargaPerKg: 3000, total: 12000 },
    { id: 'SET006', tanggal: '2025-02-18', nasabahId: 'N002', jenisSampahId: 'S003', berat: 2, hargaPerKg: 8000, total: 16000 },
    { id: 'SET007', tanggal: '2025-03-01', nasabahId: 'N003', jenisSampahId: 'S002', berat: 12, hargaPerKg: 1500, total: 18000 },
    { id: 'SET008', tanggal: '2025-03-10', nasabahId: 'N001', jenisSampahId: 'S005', berat: 6, hargaPerKg: 1000, total: 6000 },
  ],

  penarikan: [
    { id: 'TAR001', tanggal: '2025-01-25', nasabahId: 'N001', jumlah: 30000 },
    { id: 'TAR002', tanggal: '2025-02-28', nasabahId: 'N002', jumlah: 20000 },
    { id: 'TAR003', tanggal: '2025-03-05', nasabahId: 'N003', jumlah: 50000 },
  ],

  nextNasabahNum: 5,
  nextJenisNum: 6,
  nextSetNum: 9,
  nextTarNum: 4,

  genId(prefix, num) { return prefix + String(num).padStart(3,'0'); },
  getNasabah(id) { return this.nasabah.find(n=>n.id===id); },
  getJenis(id) { return this.jenisSampah.find(j=>j.id===id); },
};

// ==================== UI STATE ====================
let currentView = '';
let loginRole = 'admin';
let charts = {};

function setLoginRole(role) {
  loginRole = role;
  document.querySelectorAll('.role-tab').forEach((t,i)=>{
    t.classList.toggle('active', (i===0&&role==='admin')||(i===1&&role==='user'));
  });
  document.getElementById('login-hint').innerHTML = role==='admin'
    ? '<strong>Demo Admin:</strong> admin / admin123'
    : '<strong>Demo Nasabah:</strong> siti/siti123 | budi/budi123 | dewi/dewi123';
}

function doLogin() {
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value.trim();
  document.getElementById('err-user').textContent = '';
  document.getElementById('err-pass').textContent = '';
  let ok = false;

  if (!username) { document.getElementById('err-user').textContent = 'Username wajib diisi'; return; }
  if (!password) { document.getElementById('err-pass').textContent = 'Password wajib diisi'; return; }

  if (loginRole === 'admin') {
    if (username === DB.admin.username && password === DB.admin.password) {
      DB.currentUser = { ...DB.admin, role: 'admin' };
      ok = true;
    }
  } else {
    const u = DB.users.find(u=>u.username===username&&u.password===password);
    if (u) {
      const n = DB.getNasabah(u.nasabahId);
      DB.currentUser = { ...u, ...n, role: 'user' };
      ok = true;
    }
  }

  if (!ok) {
    document.getElementById('err-pass').textContent = 'Username atau password salah';
    document.getElementById('login-password').classList.add('error');
    return;
  }

  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('app').classList.add('active');
  initApp();
  toast('Selamat datang, ' + DB.currentUser.name + '! 👋');
}

function doLogout() {
  showConfirm('Keluar?', 'Apakah Anda yakin ingin keluar dari aplikasi?', ()=>{
    DB.currentUser = null;
    document.getElementById('app').classList.remove('active');
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('login-username').value = '';
    document.getElementById('login-password').value = '';
    document.getElementById('login-password').classList.remove('error');
    // destroy charts
    Object.values(charts).forEach(c=>{ try{c.destroy()}catch(e){} });
    charts = {};
  });
}

function initApp() {
  const u = DB.currentUser;
  document.getElementById('sidebar-username').textContent = u.name || u.username;
  document.getElementById('sidebar-userrole').textContent = u.role === 'admin' ? 'Administrator' : 'Nasabah';
  document.getElementById('sidebar-role-badge').textContent = u.role === 'admin' ? 'Admin' : 'Nasabah';
  document.getElementById('sidebar-avatar').textContent = u.role === 'admin' ? '🛡️' : '🙋';
  renderNav();
  updateDate();
  setInterval(updateDate, 60000);
  navigate(u.role === 'admin' ? 'admin-dashboard' : 'user-dashboard');
}

function updateDate() {
  const d = new Date();
  document.getElementById('topbar-date').textContent = d.toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
}

const ADMIN_NAV = [
  { section: 'UTAMA' },
  { id:'admin-dashboard', icon:'🏠', label:'Dashboard' },
  { id:'admin-nasabah', icon:'👥', label:'Data Nasabah' },
  { id:'admin-sampah', icon:'♻️', label:'Jenis Sampah' },
  { section: 'TRANSAKSI' },
  { id:'admin-setoran', icon:'📥', label:'Input Setoran' },
  { id:'admin-penarikan', icon:'💸', label:'Input Penarikan' },
  { id:'admin-riwayat', icon:'📋', label:'Riwayat Transaksi' },
];
const USER_NAV = [
  { section: 'UTAMA' },
  { id:'user-dashboard', icon:'🏠', label:'Dashboard' },
  { id:'user-setoran', icon:'📥', label:'Riwayat Setoran' },
  { id:'user-penarikan', icon:'💸', label:'Riwayat Penarikan' },
  { section: 'INFO' },
  { id:'user-harga', icon:'💰', label:'Harga Sampah' },
  { id:'user-profil', icon:'👤', label:'Profil Saya' },
];

function renderNav() {
  const nav = DB.currentUser.role === 'admin' ? ADMIN_NAV : USER_NAV;
  document.getElementById('sidebar-nav').innerHTML = nav.map(item => {
    if (item.section) return `<div class="nav-section-label">${item.section}</div>`;
    return `<button class="nav-item" id="nav-${item.id}" onclick="navigate('${item.id}')">
      <span class="nav-icon">${item.icon}</span>${item.label}
    </button>`;
  }).join('');
}

function navigate(view) {
  currentView = view;
  document.querySelectorAll('.nav-item').forEach(el=>el.classList.remove('active'));
  const navEl = document.getElementById('nav-'+view);
  if (navEl) navEl.classList.add('active');
  const labels = { 'admin-dashboard':'Dashboard','admin-nasabah':'Data Nasabah','admin-sampah':'Jenis Sampah','admin-setoran':'Input Setoran','admin-penarikan':'Input Penarikan','admin-riwayat':'Riwayat Transaksi','user-dashboard':'Dashboard','user-setoran':'Riwayat Setoran','user-penarikan':'Riwayat Penarikan','user-harga':'Harga Sampah','user-profil':'Profil Saya' };
  document.getElementById('topbar-title').textContent = labels[view] || view;
  renderView(view);
  closeSidebar();
}

function renderView(view) {
  const el = document.getElementById('page-content');
  Object.values(charts).forEach(c=>{ try{c.destroy()}catch(e){} });
  charts = {};
  const renderers = {
    'admin-dashboard': renderAdminDashboard,
    'admin-nasabah': renderAdminNasabah,
    'admin-sampah': renderAdminSampah,
    'admin-setoran': renderAdminSetoran,
    'admin-penarikan': renderAdminPenarikan,
    'admin-riwayat': renderAdminRiwayat,
    'user-dashboard': renderUserDashboard,
    'user-setoran': renderUserSetoran,
    'user-penarikan': renderUserPenarikan,
    'user-harga': renderUserHarga,
    'user-profil': renderUserProfil,
  };
  if (renderers[view]) {
    el.innerHTML = renderers[view]();
    if (view === 'admin-dashboard') initAdminCharts();
    if (view === 'user-dashboard') initUserChart();
  }
}

// ==================== HELPERS ====================
function fmt(n) { return 'Rp ' + Number(n).toLocaleString('id-ID'); }
function fmtDate(d) { return new Date(d).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'}); }
function uid() { return Date.now().toString(36); }
function toast(msg, type='success') {
  const icons = {success:'✅', error:'❌', warning:'⚠️'};
  const t = document.createElement('div');
  t.className = `toast ${type==='success'?'':type}`;
  t.innerHTML = `<span class="toast-icon">${icons[type]||'ℹ️'}</span><span class="toast-msg">${msg}</span>`;
  document.getElementById('toast-container').appendChild(t);
  setTimeout(()=>t.remove(), 3500);
}
function showModal(title, body, footer, lg=false) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = body;
  document.getElementById('modal-footer').innerHTML = footer;
  document.getElementById('modal-box').className = 'modal' + (lg?' modal-lg':'');
  document.getElementById('modal-overlay').classList.add('active');
}
function closeModal() { document.getElementById('modal-overlay').classList.remove('active'); }
function showConfirm(title, msg, onYes, danger=false) {
  showModal(title, `<div class="confirm-icon">${danger?'🗑️':'❓'}</div><div class="confirm-text">${msg}</div>`,
    `<button class="btn btn-secondary" onclick="closeModal()">Batal</button>
     <button class="btn ${danger?'btn-danger':'btn-primary'}" onclick="closeModal();(${onYes.toString()})()">Ya, Lanjutkan</button>`
  );
}
function v(id){ return document.getElementById(id); }
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebar-overlay').classList.toggle('active');
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-overlay').classList.remove('active');
}

// ==================== ADMIN DASHBOARD ====================
function renderAdminDashboard() {
  const totalSaldo = DB.nasabah.reduce((s,n)=>s+n.saldo,0);
  const totalBerat = DB.setoran.reduce((s,t)=>s+t.berat,0);
  const totalSetoran = DB.setoran.reduce((s,t)=>s+t.total,0);
  const totalNasabah = DB.nasabah.length;
  return `
  <div class="page-header"><h2>Dashboard Admin</h2><p>Ringkasan data Bank Sampah EcoBank</p></div>
  <div class="stat-grid">
    <div class="stat-card green">
      <div class="stat-icon">👥</div>
      <div class="stat-label">Total Nasabah</div>
      <div class="stat-value">${totalNasabah}</div>
      <div class="stat-sub">Nasabah aktif</div>
      <span class="stat-change up">▲ Terdaftar</span>
    </div>
    <div class="stat-card yellow">
      <div class="stat-icon">⚖️</div>
      <div class="stat-label">Total Berat Sampah</div>
      <div class="stat-value">${totalBerat} kg</div>
      <div class="stat-sub">Semua setoran</div>
    </div>
    <div class="stat-card blue">
      <div class="stat-icon">💰</div>
      <div class="stat-label">Total Saldo Nasabah</div>
      <div class="stat-value">${(totalSaldo/1000).toFixed(0)}K</div>
      <div class="stat-sub">${fmt(totalSaldo)}</div>
    </div>
    <div class="stat-card orange">
      <div class="stat-icon">📦</div>
      <div class="stat-label">Total Transaksi</div>
      <div class="stat-value">${DB.setoran.length+DB.penarikan.length}</div>
      <div class="stat-sub">${fmt(totalSetoran)} disetorkan</div>
    </div>
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
    <div class="card">
      <div class="card-header"><div class="card-title">📊 Grafik Setoran Bulanan</div></div>
      <div class="chart-area"><canvas id="chart-setoran"></canvas></div>
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title">🥧 Komposisi Jenis Sampah</div></div>
      <div class="chart-area"><canvas id="chart-jenis"></canvas></div>
    </div>
  </div>
  <div class="card">
    <div class="card-header"><div class="card-title">📋 Setoran Terbaru</div></div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Tanggal</th><th>Nasabah</th><th>Jenis Sampah</th><th>Berat</th><th>Total</th></tr></thead>
        <tbody>${DB.setoran.slice(-5).reverse().map(s=>{
          const n=DB.getNasabah(s.nasabahId), j=DB.getJenis(s.jenisSampahId);
          return `<tr><td>${fmtDate(s.tanggal)}</td><td>${n?n.name:'-'}</td><td>${j?j.jenis:'-'}</td><td>${s.berat} kg</td><td><span class="badge badge-green">${fmt(s.total)}</span></td></tr>`;
        }).join('')}</tbody>
      </table>
    </div>
  </div>`;
}
function initAdminCharts() {
  // Setoran bulanan
  const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
  const monthData = Array(12).fill(0);
  DB.setoran.forEach(s=>{ const m=new Date(s.tanggal).getMonth(); monthData[m]+=s.total; });
  charts['setoran'] = new Chart(v('chart-setoran'), {
    type: 'bar',
    data: { labels: months, datasets: [{ label: 'Total Setoran (Rp)', data: monthData, backgroundColor: 'rgba(39,196,125,.75)', borderRadius: 8, borderSkipped: false }] },
    options: { responsive:true, plugins:{legend:{display:false}}, scales:{ y:{ticks:{callback:v=>v>=1000?(v/1000)+'K':v}} } }
  });
  // Jenis sampah
  const jenisData = DB.jenisSampah.map(j=>({ label:j.jenis, val:DB.setoran.filter(s=>s.jenisSampahId===j.id).reduce((a,s)=>a+s.berat,0) }));
  charts['jenis'] = new Chart(v('chart-jenis'), {
    type: 'doughnut',
    data: { labels: jenisData.map(d=>d.label), datasets:[{ data: jenisData.map(d=>d.val), backgroundColor:['#27c47d','#f4c430','#4299e1','#ff7043','#9f7aea'], borderWidth:0 }] },
    options: { responsive:true, plugins:{legend:{position:'bottom',labels:{font:{size:11}}}} }
  });
}

// ==================== ADMIN NASABAH ====================
function renderAdminNasabah(q='') {
  let list = DB.nasabah.filter(n=>!q||n.name.toLowerCase().includes(q)||n.id.toLowerCase().includes(q)||n.hp.includes(q));
  return `
  <div class="page-header-row">
    <div class="page-header"><h2>Data Nasabah</h2><p>Kelola data nasabah bank sampah</p></div>
    <button class="btn btn-primary" onclick="modalTambahNasabah()">➕ Tambah Nasabah</button>
  </div>
  <div class="card" style="margin-top:16px">
    <div class="card-header">
      <div class="card-title">Daftar Nasabah (${list.length})</div>
      <div class="search-bar-wrap">
        <span class="search-icon">🔍</span>
        <input class="form-control search-bar" placeholder="Cari nama/ID/HP..." style="width:220px"
          oninput="document.getElementById('page-content').innerHTML=renderAdminNasabah(this.value.toLowerCase());bindNasabah(this.value)" value="${q}">
      </div>
    </div>
    <div class="table-wrap" id="nasabah-table">
      <table>
        <thead><tr><th>ID</th><th>Nama</th><th>Alamat</th><th>No HP</th><th>Saldo</th><th>Aksi</th></tr></thead>
        <tbody id="tbody-nasabah">${list.length?list.map(n=>`
          <tr>
            <td><span class="badge badge-green">${n.id}</span></td>
            <td><strong>${n.name}</strong></td>
            <td style="max-width:180px;font-size:12.5px">${n.alamat}</td>
            <td>${n.hp}</td>
            <td style="font-weight:700;color:var(--g3)">${fmt(n.saldo)}</td>
            <td><div class="table-actions">
              <button class="btn btn-warning btn-sm" onclick="modalEditNasabah('${n.id}')">✏️ Edit</button>
              <button class="btn btn-danger btn-sm" onclick="hapusNasabah('${n.id}')">🗑️</button>
            </div></td>
          </tr>`).join(''):`<tr><td colspan="6"><div class="empty-state"><div class="icon">👥</div><h3>Belum ada nasabah</h3><p>Klik "Tambah Nasabah" untuk menambahkan</p></div></td></tr>`}
        </tbody>
      </table>
    </div>
  </div>`;
}
function bindNasabah(q){ /* search handled inline */ }

function modalTambahNasabah() {
  showModal('Tambah Nasabah Baru', `
    <div class="form-group"><label>Nama Lengkap</label><input id="fn-nama" class="form-control" placeholder="Nama lengkap nasabah"></div>
    <div class="form-group"><label>Alamat</label><textarea id="fn-alamat" class="form-control" placeholder="Alamat lengkap"></textarea></div>
    <div class="form-group"><label>No HP</label><input id="fn-hp" class="form-control" placeholder="08xxxxxxxxxx" type="tel"></div>
    <div class="form-error" id="fn-err"></div>`,
    `<button class="btn btn-secondary" onclick="closeModal()">Batal</button>
     <button class="btn btn-primary" onclick="simpanNasabah()">💾 Simpan</button>`
  );
}
function simpanNasabah() {
  const nama=v('fn-nama').value.trim(), alamat=v('fn-alamat').value.trim(), hp=v('fn-hp').value.trim();
  if(!nama||!alamat||!hp){v('fn-err').textContent='Semua field wajib diisi';return;}
  if(!/^08\d{7,12}$/.test(hp)){v('fn-err').textContent='No HP tidak valid';return;}
  const id = DB.genId('N', DB.nextNasabahNum++);
  DB.nasabah.push({id, name:nama, alamat, hp, saldo:0});
  // add user account
  DB.users.push({username:nama.split(' ')[0].toLowerCase(), password:'user123', nasabahId:id});
  closeModal(); toast('Nasabah '+nama+' berhasil ditambahkan!');
  renderView('admin-nasabah');
}
function modalEditNasabah(id) {
  const n = DB.getNasabah(id);
  showModal('Edit Nasabah', `
    <div class="form-group"><label>Nama Lengkap</label><input id="en-nama" class="form-control" value="${n.name}"></div>
    <div class="form-group"><label>Alamat</label><textarea id="en-alamat" class="form-control">${n.alamat}</textarea></div>
    <div class="form-group"><label>No HP</label><input id="en-hp" class="form-control" value="${n.hp}" type="tel"></div>
    <div class="form-error" id="en-err"></div>`,
    `<button class="btn btn-secondary" onclick="closeModal()">Batal</button>
     <button class="btn btn-primary" onclick="updateNasabah('${id}')">💾 Simpan</button>`
  );
}
function updateNasabah(id) {
  const n=DB.getNasabah(id), nama=v('en-nama').value.trim(), alamat=v('en-alamat').value.trim(), hp=v('en-hp').value.trim();
  if(!nama||!alamat||!hp){v('en-err').textContent='Semua field wajib diisi';return;}
  n.name=nama; n.alamat=alamat; n.hp=hp;
  closeModal(); toast('Data nasabah berhasil diperbarui!');
  renderView('admin-nasabah');
}
function hapusNasabah(id) {
  const n=DB.getNasabah(id);
  showConfirm('Hapus Nasabah', `Yakin hapus nasabah <strong>${n.name}</strong>? Data transaksinya juga akan dihapus.`, ()=>{
    DB.nasabah = DB.nasabah.filter(x=>x.id!==id);
    DB.setoran = DB.setoran.filter(x=>x.nasabahId!==id);
    DB.penarikan = DB.penarikan.filter(x=>x.nasabahId!==id);
    DB.users = DB.users.filter(x=>x.nasabahId!==id);
    toast('Nasabah berhasil dihapus','warning');
    renderView('admin-nasabah');
  }, true);
}

// ==================== ADMIN JENIS SAMPAH ====================
function renderAdminSampah() {
  return `
  <div class="page-header-row">
    <div class="page-header"><h2>Jenis Sampah</h2><p>Kelola kategori dan harga sampah</p></div>
    <button class="btn btn-primary" onclick="modalTambahJenis()">➕ Tambah Jenis</button>
  </div>
  <div class="card" style="margin-top:16px">
    <div class="card-header"><div class="card-title">Daftar Jenis Sampah (${DB.jenisSampah.length})</div></div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>ID</th><th>Jenis Sampah</th><th>Harga per Kg</th><th>Total Disetorkan</th><th>Aksi</th></tr></thead>
        <tbody>${DB.jenisSampah.map(j=>{
          const tot = DB.setoran.filter(s=>s.jenisSampahId===j.id).reduce((a,s)=>a+s.berat,0);
          return `<tr>
            <td><span class="badge badge-blue">${j.id}</span></td>
            <td><strong>${j.jenis}</strong></td>
            <td style="color:var(--g3);font-weight:700">${fmt(j.harga)}/kg</td>
            <td>${tot} kg</td>
            <td><div class="table-actions">
              <button class="btn btn-warning btn-sm" onclick="modalEditJenis('${j.id}')">✏️ Edit</button>
              <button class="btn btn-danger btn-sm" onclick="hapusJenis('${j.id}')">🗑️</button>
            </div></td>
          </tr>`;
        }).join('')}</tbody>
      </table>
    </div>
  </div>`;
}
function modalTambahJenis() {
  showModal('Tambah Jenis Sampah', `
    <div class="form-group"><label>Nama Jenis Sampah</label><input id="fj-jenis" class="form-control" placeholder="cth: Botol Plastik"></div>
    <div class="form-group"><label>Harga per Kg (Rp)</label><input id="fj-harga" class="form-control" type="number" placeholder="0" min="0"></div>
    <div class="form-error" id="fj-err"></div>`,
    `<button class="btn btn-secondary" onclick="closeModal()">Batal</button>
     <button class="btn btn-primary" onclick="simpanJenis()">💾 Simpan</button>`
  );
}
function simpanJenis() {
  const jenis=v('fj-jenis').value.trim(), harga=parseInt(v('fj-harga').value);
  if(!jenis){v('fj-err').textContent='Nama jenis wajib diisi';return;}
  if(!harga||harga<0){v('fj-err').textContent='Harga tidak valid';return;}
  const id=DB.genId('S',DB.nextJenisNum++);
  DB.jenisSampah.push({id,jenis,harga});
  closeModal(); toast('Jenis sampah '+jenis+' ditambahkan!');
  renderView('admin-sampah');
}
function modalEditJenis(id) {
  const j=DB.getJenis(id);
  showModal('Edit Jenis Sampah', `
    <div class="form-group"><label>Nama Jenis Sampah</label><input id="ej-jenis" class="form-control" value="${j.jenis}"></div>
    <div class="form-group"><label>Harga per Kg (Rp)</label><input id="ej-harga" class="form-control" type="number" value="${j.harga}" min="0"></div>
    <div class="form-error" id="ej-err"></div>`,
    `<button class="btn btn-secondary" onclick="closeModal()">Batal</button>
     <button class="btn btn-primary" onclick="updateJenis('${id}')">💾 Simpan</button>`
  );
}
function updateJenis(id) {
  const j=DB.getJenis(id), jenis=v('ej-jenis').value.trim(), harga=parseInt(v('ej-harga').value);
  if(!jenis){v('ej-err').textContent='Nama jenis wajib diisi';return;}
  if(!harga||harga<0){v('ej-err').textContent='Harga tidak valid';return;}
  j.jenis=jenis; j.harga=harga;
  closeModal(); toast('Jenis sampah diperbarui!');
  renderView('admin-sampah');
}
function hapusJenis(id) {
  const j=DB.getJenis(id);
  showConfirm('Hapus Jenis Sampah', `Yakin hapus <strong>${j.jenis}</strong>?`, ()=>{
    DB.jenisSampah=DB.jenisSampah.filter(x=>x.id!==id);
    toast('Jenis sampah dihapus','warning');
    renderView('admin-sampah');
  }, true);
}

// ==================== ADMIN SETORAN ====================
function renderAdminSetoran() {
  return `
  <div class="page-header"><h2>Input Setoran Sampah</h2><p>Catat setoran sampah nasabah</p></div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
    <div class="card">
      <div class="card-header"><div class="card-title">📝 Form Setoran</div></div>
      <div class="card-body">
        <div class="form-group"><label>Tanggal Setoran</label><input id="set-tgl" type="date" class="form-control" value="${new Date().toISOString().slice(0,10)}"></div>
        <div class="form-group">
          <label>Nasabah</label>
          <select id="set-nasabah" class="form-control" onchange="updateJenisOptions()">
            <option value="">-- Pilih Nasabah --</option>
            ${DB.nasabah.map(n=>`<option value="${n.id}">${n.name} (${n.id})</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Jenis Sampah</label>
          <select id="set-jenis" class="form-control" onchange="calcTotal()">
            <option value="">-- Pilih Jenis --</option>
            ${DB.jenisSampah.map(j=>`<option value="${j.id}" data-harga="${j.harga}">${j.jenis} (${fmt(j.harga)}/kg)</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Berat (kg)</label>
          <input id="set-berat" type="number" class="form-control" placeholder="0.0" min="0.1" step="0.1" oninput="calcTotal()">
        </div>
        <div class="form-row">
          <div class="form-group"><label>Harga/kg</label><input id="set-harga" class="form-control" readonly style="background:var(--gray7);font-weight:700;color:var(--g3)"></div>
          <div class="form-group"><label>Total</label><input id="set-total" class="form-control" readonly style="background:var(--gray7);font-weight:800;color:var(--g2);font-size:16px"></div>
        </div>
        <div class="form-error" id="set-err"></div>
        <button class="btn btn-primary btn-full" style="margin-top:8px" onclick="simpanSetoran()">💾 Simpan Setoran</button>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title">📋 Riwayat Setoran Hari Ini</div></div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Nasabah</th><th>Jenis</th><th>Berat</th><th>Total</th></tr></thead>
          <tbody id="today-setoran">${renderTodaySetoran()}</tbody>
        </table>
      </div>
    </div>
  </div>`;
}
function renderTodaySetoran() {
  const today = new Date().toISOString().slice(0,10);
  const list = DB.setoran.filter(s=>s.tanggal===today);
  if(!list.length) return `<tr><td colspan="4"><div class="empty-state" style="padding:24px"><div class="icon" style="font-size:32px">📭</div><p>Belum ada setoran hari ini</p></div></td></tr>`;
  return list.map(s=>{
    const n=DB.getNasabah(s.nasabahId), j=DB.getJenis(s.jenisSampahId);
    return `<tr><td>${n?n.name:'-'}</td><td>${j?j.jenis:'-'}</td><td>${s.berat}kg</td><td><span class="badge badge-green">${fmt(s.total)}</span></td></tr>`;
  }).join('');
}
function calcTotal() {
  const sel=v('set-jenis'), berat=parseFloat(v('set-berat').value)||0;
  const opt=sel.options[sel.selectedIndex];
  const harga=opt?parseInt(opt.getAttribute('data-harga')||0):0;
  v('set-harga').value = harga?fmt(harga):'';
  v('set-total').value = harga&&berat?fmt(harga*berat):'';
}
function updateJenisOptions(){calcTotal();}
function simpanSetoran() {
  const tgl=v('set-tgl').value, nasabahId=v('set-nasabah').value, jenisId=v('set-jenis').value;
  const berat=parseFloat(v('set-berat').value);
  v('set-err').textContent='';
  if(!tgl||!nasabahId||!jenisId||!berat||berat<=0){v('set-err').textContent='Semua field wajib diisi dengan benar';return;}
  const j=DB.getJenis(jenisId);
  const total=Math.round(berat*j.harga);
  const id=DB.genId('SET',DB.nextSetNum++);
  DB.setoran.push({id,tanggal:tgl,nasabahId,jenisSampahId:jenisId,berat,hargaPerKg:j.harga,total});
  // update saldo
  DB.getNasabah(nasabahId).saldo += total;
  toast(`Setoran berhasil! Saldo nasabah bertambah ${fmt(total)}`);
  renderView('admin-setoran');
}

// ==================== ADMIN PENARIKAN ====================
function renderAdminPenarikan() {
  return `
  <div class="page-header"><h2>Input Penarikan Saldo</h2><p>Proses penarikan saldo nasabah</p></div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
    <div class="card">
      <div class="card-header"><div class="card-title">💸 Form Penarikan</div></div>
      <div class="card-body">
        <div class="form-group"><label>Tanggal</label><input id="tar-tgl" type="date" class="form-control" value="${new Date().toISOString().slice(0,10)}"></div>
        <div class="form-group">
          <label>Nasabah</label>
          <select id="tar-nasabah" class="form-control" onchange="showSaldoNasabah()">
            <option value="">-- Pilih Nasabah --</option>
            ${DB.nasabah.map(n=>`<option value="${n.id}">${n.name} — ${fmt(n.saldo)}</option>`).join('')}
          </select>
        </div>
        <div id="info-saldo" style="background:var(--g7);border-radius:10px;padding:12px;margin-bottom:14px;display:none">
          <div style="font-size:12px;color:var(--gray5)">Saldo Tersedia</div>
          <div id="saldo-display" style="font-size:22px;font-weight:800;color:var(--g2)"></div>
        </div>
        <div class="form-group">
          <label>Jumlah Penarikan (Rp)</label>
          <input id="tar-jumlah" type="number" class="form-control" placeholder="0" min="1000" step="1000">
        </div>
        <div class="form-error" id="tar-err"></div>
        <button class="btn btn-accent btn-full" style="margin-top:8px" onclick="simpanPenarikan()">💸 Proses Penarikan</button>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title">📋 Penarikan Terbaru</div></div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Tanggal</th><th>Nasabah</th><th>Jumlah</th></tr></thead>
          <tbody>${DB.penarikan.slice(-6).reverse().map(p=>{
            const n=DB.getNasabah(p.nasabahId);
            return `<tr><td>${fmtDate(p.tanggal)}</td><td>${n?n.name:'-'}</td><td><span class="badge badge-red">${fmt(p.jumlah)}</span></td></tr>`;
          }).join('')}</tbody>
        </table>
      </div>
    </div>
  </div>`;
}
function showSaldoNasabah() {
  const id=v('tar-nasabah').value, n=DB.getNasabah(id);
  const info=v('info-saldo');
  if(n){info.style.display='block';v('saldo-display').textContent=fmt(n.saldo);}
  else info.style.display='none';
}
function simpanPenarikan() {
  const tgl=v('tar-tgl').value, nasabahId=v('tar-nasabah').value, jumlah=parseInt(v('tar-jumlah').value);
  v('tar-err').textContent='';
  if(!tgl||!nasabahId||!jumlah||jumlah<1000){v('tar-err').textContent='Semua field wajib diisi (min Rp 1.000)';return;}
  const n=DB.getNasabah(nasabahId);
  if(jumlah>n.saldo){v('tar-err').textContent=`Saldo tidak cukup! Saldo: ${fmt(n.saldo)}`;return;}
  const id=DB.genId('TAR',DB.nextTarNum++);
  DB.penarikan.push({id,tanggal:tgl,nasabahId,jumlah});
  n.saldo-=jumlah;
  toast(`Penarikan ${fmt(jumlah)} berhasil!`);
  renderView('admin-penarikan');
}

// ==================== ADMIN RIWAYAT ====================
function renderAdminRiwayat() {
  const all = [
    ...DB.setoran.map(s=>({...s,type:'setoran'})),
    ...DB.penarikan.map(p=>({...p,type:'penarikan'}))
  ].sort((a,b)=>new Date(b.tanggal)-new Date(a.tanggal));
  return `
  <div class="page-header"><h2>Riwayat Transaksi</h2><p>Semua riwayat transaksi bank sampah</p></div>
  <div class="card">
    <div class="card-header">
      <div class="card-title">Semua Transaksi (${all.length})</div>
      <div style="display:flex;gap:8px;font-size:13px">
        <span class="badge badge-green">✅ ${DB.setoran.length} Setoran</span>
        <span class="badge badge-red">💸 ${DB.penarikan.length} Penarikan</span>
      </div>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>ID</th><th>Tanggal</th><th>Nasabah</th><th>Tipe</th><th>Detail</th><th>Jumlah</th></tr></thead>
        <tbody>${all.map(t=>{
          const n=DB.getNasabah(t.nasabahId);
          if(t.type==='setoran'){
            const j=DB.getJenis(t.jenisSampahId);
            return `<tr>
              <td style="font-size:11px;color:var(--gray5)">${t.id}</td>
              <td>${fmtDate(t.tanggal)}</td>
              <td>${n?n.name:'-'}</td>
              <td><span class="badge badge-green">📥 Setoran</span></td>
              <td style="font-size:12.5px">${j?j.jenis:'-'} · ${t.berat}kg</td>
              <td style="font-weight:700;color:var(--g3)">${fmt(t.total)}</td>
            </tr>`;
          } else {
            return `<tr>
              <td style="font-size:11px;color:var(--gray5)">${t.id}</td>
              <td>${fmtDate(t.tanggal)}</td>
              <td>${n?n.name:'-'}</td>
              <td><span class="badge badge-red">💸 Penarikan</span></td>
              <td style="font-size:12.5px;color:var(--gray5)">—</td>
              <td style="font-weight:700;color:#e53e3e">${fmt(t.jumlah)}</td>
            </tr>`;
          }
        }).join('')}</tbody>
      </table>
    </div>
  </div>`;
}

// ==================== USER DASHBOARD ====================
function renderUserDashboard() {
  const n = DB.getNasabah(DB.currentUser.nasabahId||DB.currentUser.id);
  if(!n) return '<p>Data nasabah tidak ditemukan</p>';
  const setoran = DB.setoran.filter(s=>s.nasabahId===n.id);
  const penarikan = DB.penarikan.filter(p=>p.nasabahId===n.id);
  const totalBerat = setoran.reduce((a,s)=>a+s.berat,0);
  const totalSetoran = setoran.reduce((a,s)=>a+s.total,0);
  return `
  <div class="page-header"><h2>Halo, ${n.name.split(' ')[0]}! 👋</h2><p>Selamat datang di EcoBank — Tabungan Sampah Anda</p></div>
  <div class="saldo-card" style="margin-bottom:20px">
    <div class="saldo-label">💰 SALDO TABUNGAN</div>
    <div class="saldo-amount">${fmt(n.saldo)}</div>
    <div class="saldo-id">ID Nasabah: ${n.id}</div>
  </div>
  <div class="stat-grid" style="margin-bottom:20px">
    <div class="stat-card green">
      <div class="stat-icon">⚖️</div>
      <div class="stat-label">Total Sampah</div>
      <div class="stat-value">${totalBerat} kg</div>
      <div class="stat-sub">Telah disetorkan</div>
    </div>
    <div class="stat-card yellow">
      <div class="stat-icon">📦</div>
      <div class="stat-label">Transaksi Setoran</div>
      <div class="stat-value">${setoran.length}</div>
      <div class="stat-sub">${fmt(totalSetoran)} diperoleh</div>
    </div>
    <div class="stat-card orange">
      <div class="stat-icon">💸</div>
      <div class="stat-label">Transaksi Tarik</div>
      <div class="stat-value">${penarikan.length}</div>
      <div class="stat-sub">${fmt(penarikan.reduce((a,p)=>a+p.jumlah,0))} ditarik</div>
    </div>
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
    <div class="card">
      <div class="card-header"><div class="card-title">📊 Grafik Setoran Saya</div></div>
      <div class="chart-area"><canvas id="chart-user"></canvas></div>
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title">📋 Setoran Terbaru</div></div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Tanggal</th><th>Jenis</th><th>Berat</th><th>Total</th></tr></thead>
          <tbody>${setoran.length?setoran.slice(-5).reverse().map(s=>{
            const j=DB.getJenis(s.jenisSampahId);
            return `<tr><td style="font-size:12px">${fmtDate(s.tanggal)}</td><td>${j?j.jenis:'-'}</td><td>${s.berat}kg</td><td><span class="badge badge-green">${fmt(s.total)}</span></td></tr>`;
          }).join(''):`<tr><td colspan="4"><div class="empty-state" style="padding:20px"><p>Belum ada setoran</p></div></td></tr>`}
          </tbody>
        </table>
      </div>
    </div>
  </div>`;
}
function initUserChart() {
  const n = DB.getNasabah(DB.currentUser.nasabahId||DB.currentUser.id);
  if(!n||!v('chart-user')) return;
  const months=['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
  const monthData=Array(12).fill(0);
  DB.setoran.filter(s=>s.nasabahId===n.id).forEach(s=>{const m=new Date(s.tanggal).getMonth();monthData[m]+=s.berat;});
  charts['user']=new Chart(v('chart-user'),{
    type:'line',
    data:{labels:months,datasets:[{label:'Berat Sampah (kg)',data:monthData,fill:true,backgroundColor:'rgba(39,196,125,.12)',borderColor:'#27c47d',borderWidth:2.5,tension:.4,pointRadius:4,pointBackgroundColor:'#27c47d'}]},
    options:{responsive:true,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true}}}
  });
}

// ==================== USER SETORAN ====================
function renderUserSetoran() {
  const n = DB.getNasabah(DB.currentUser.nasabahId||DB.currentUser.id);
  const list = DB.setoran.filter(s=>s.nasabahId===n.id).sort((a,b)=>new Date(b.tanggal)-new Date(a.tanggal));
  return `
  <div class="page-header"><h2>Riwayat Setoran</h2><p>Semua riwayat setoran sampah Anda</p></div>
  <div class="card">
    <div class="card-header">
      <div class="card-title">Setoran Saya (${list.length})</div>
      <span class="badge badge-green">⚖️ ${list.reduce((a,s)=>a+s.berat,0)} kg total</span>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Tanggal</th><th>Jenis Sampah</th><th>Berat</th><th>Harga/kg</th><th>Total</th></tr></thead>
        <tbody>${list.length?list.map(s=>{
          const j=DB.getJenis(s.jenisSampahId);
          return `<tr>
            <td>${fmtDate(s.tanggal)}</td>
            <td>${j?j.jenis:'-'}</td>
            <td><strong>${s.berat} kg</strong></td>
            <td>${fmt(s.hargaPerKg)}</td>
            <td><span class="badge badge-green">${fmt(s.total)}</span></td>
          </tr>`;
        }).join(''):`<tr><td colspan="5"><div class="empty-state"><div class="icon">📭</div><h3>Belum ada setoran</h3><p>Setorkan sampah Anda ke petugas bank sampah</p></div></td></tr>`}
        </tbody>
      </table>
    </div>
  </div>`;
}

// ==================== USER PENARIKAN ====================
function renderUserPenarikan() {
  const n = DB.getNasabah(DB.currentUser.nasabahId||DB.currentUser.id);
  const list = DB.penarikan.filter(p=>p.nasabahId===n.id).sort((a,b)=>new Date(b.tanggal)-new Date(a.tanggal));
  return `
  <div class="page-header"><h2>Riwayat Penarikan</h2><p>Semua riwayat penarikan saldo Anda</p></div>
  <div style="margin-bottom:16px">
    <div class="saldo-card" style="max-width:400px">
      <div class="saldo-label">💰 SALDO SAAT INI</div>
      <div class="saldo-amount">${fmt(n.saldo)}</div>
    </div>
  </div>
  <div class="card">
    <div class="card-header">
      <div class="card-title">Penarikan Saya (${list.length})</div>
      <span class="badge badge-red">💸 ${fmt(list.reduce((a,p)=>a+p.jumlah,0))} total</span>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Tanggal</th><th>Jumlah Penarikan</th><th>Status</th></tr></thead>
        <tbody>${list.length?list.map(p=>`<tr>
          <td>${fmtDate(p.tanggal)}</td>
          <td style="font-weight:700;color:#e53e3e;font-size:16px">${fmt(p.jumlah)}</td>
          <td><span class="badge badge-green">✅ Berhasil</span></td>
        </tr>`).join(''):`<tr><td colspan="3"><div class="empty-state"><div class="icon">💸</div><h3>Belum ada penarikan</h3><p>Hubungi petugas untuk menarik saldo Anda</p></div></td></tr>`}
        </tbody>
      </table>
    </div>
  </div>`;
}

// ==================== USER HARGA ====================
function renderUserHarga() {
  return `
  <div class="page-header"><h2>Harga Sampah</h2><p>Daftar harga pembelian sampah saat ini</p></div>
  <div class="stat-grid" style="margin-bottom:20px">
    <div class="stat-card green">
      <div class="stat-icon">📦</div>
      <div class="stat-label">Jenis Sampah</div>
      <div class="stat-value">${DB.jenisSampah.length}</div>
      <div class="stat-sub">Kategori aktif</div>
    </div>
    <div class="stat-card yellow">
      <div class="stat-icon">💰</div>
      <div class="stat-label">Harga Tertinggi</div>
      <div class="stat-value">${(Math.max(...DB.jenisSampah.map(j=>j.harga))/1000).toFixed(0)}K</div>
      <div class="stat-sub">per kilogram</div>
    </div>
  </div>
  <div class="card">
    <div class="card-header"><div class="card-title">💰 Daftar Harga Sampah</div></div>
    <div style="padding:16px;display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px">
      ${DB.jenisSampah.map(j=>`
        <div style="background:var(--gray7);border-radius:12px;padding:18px;border:1.5px solid transparent;transition:var(--transition)" onmouseover="this.style.borderColor='var(--g4)'" onmouseout="this.style.borderColor='transparent'">
          <div style="font-size:24px;margin-bottom:8px">♻️</div>
          <div style="font-weight:700;font-size:14.5px;color:var(--text);margin-bottom:4px">${j.jenis}</div>
          <div style="font-size:22px;font-weight:800;color:var(--g3)">${fmt(j.harga)}</div>
          <div style="font-size:12px;color:var(--gray5)">per kilogram</div>
          <div style="background:var(--g7);border-radius:8px;padding:6px 10px;margin-top:10px;font-size:12px;color:var(--g2)">
            1 kg = <strong>${fmt(j.harga)}</strong>
          </div>
        </div>`).join('')}
    </div>
  </div>`;
}

// ==================== USER PROFIL ====================
function renderUserProfil() {
  const n = DB.getNasabah(DB.currentUser.nasabahId||DB.currentUser.id);
  const setoran = DB.setoran.filter(s=>s.nasabahId===n.id);
  const totalBerat = setoran.reduce((a,s)=>a+s.berat,0);
  return `
  <div class="page-header"><h2>Profil Saya</h2><p>Informasi akun dan data nasabah Anda</p></div>
  <div style="display:grid;grid-template-columns:340px 1fr;gap:16px;align-items:start">
    <div class="card">
      <div class="profile-banner"></div>
      <div class="profile-avatar">🙋</div>
      <div class="profile-info">
        <h3>${n.name}</h3>
        <p>ID: ${n.id}</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:16px 16px 0">
          <div style="background:var(--g7);border-radius:10px;padding:12px;text-align:center">
            <div style="font-size:18px;font-weight:800;color:var(--g2)">${setoran.length}</div>
            <div style="font-size:11px;color:var(--gray5)">Setoran</div>
          </div>
          <div style="background:var(--g7);border-radius:10px;padding:12px;text-align:center">
            <div style="font-size:18px;font-weight:800;color:var(--g2)">${totalBerat}kg</div>
            <div style="font-size:11px;color:var(--gray5)">Total Sampah</div>
          </div>
        </div>
      </div>
    </div>
    <div style="display:flex;flex-direction:column;gap:16px">
      <div class="card">
        <div class="card-header"><div class="card-title">👤 Data Pribadi</div></div>
        <div class="card-body">
          ${[['Nama Lengkap',n.name,'👤'],['ID Nasabah',n.id,'🪪'],['No HP',n.hp,'📱'],['Alamat',n.alamat,'🏠']].map(([label,val,icon])=>`
            <div style="display:flex;gap:12px;padding:12px 0;border-bottom:1px solid var(--gray7)">
              <div style="width:36px;height:36px;background:var(--g7);border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:17px;flex-shrink:0">${icon}</div>
              <div>
                <div style="font-size:11.5px;color:var(--gray5);font-weight:600;text-transform:uppercase;letter-spacing:.5px">${label}</div>
                <div style="font-weight:600;color:var(--text);margin-top:2px">${val}</div>
              </div>
            </div>`).join('')}
        </div>
      </div>
      <div class="saldo-card">
        <div class="saldo-label">💰 SALDO TABUNGAN</div>
        <div class="saldo-amount">${fmt(n.saldo)}</div>
        <div class="saldo-id">Saldo dapat dicairkan melalui petugas bank sampah</div>
      </div>
    </div>
  </div>`;
}

// ==================== INIT ====================
window.onload = () => {
  document.getElementById('login-screen').style.display = 'flex';
};
</script>
