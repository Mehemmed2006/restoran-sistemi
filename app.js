// ============================================================
// 🍽️ RESTORAN SİSTEMİ — FIREBASE + TOAST + CONFIRM + GOOGLE MAPS
// ============================================================
console.log('✅ app.js yükləndi (v6)');

window.addEventListener('error', e => {
    let b = document.getElementById('xetaQutusu');
    if (!b) {
        b = document.createElement('pre');
        b.id = 'xetaQutusu';
        b.style.cssText = 'position:fixed;left:10px;right:10px;bottom:10px;z-index:99999;background:#7a1020;color:#fff;padding:12px;border-radius:8px;font-size:13px;white-space:pre-wrap;max-height:40vh;overflow:auto;';
        (document.body || document.documentElement).appendChild(b);
    }
    b.textContent += '❌ ' + (e.message || 'Xəta') + (e.lineno ? ' (sətir ' + e.lineno + ')' : '') + '\n';
});

// ==================== MENYU ====================
const MENYU = {
    'Dönərlər': {'Toyuq çörək': 2.80, 'Toyuq lavaş': 3.00, 'Ət çörək': 3.70, 'Ət lavaş': 3.90, 'Ət plovüstü': 12.50, 'Toyuq plovüstü': 11.50, 'İskəndər': 12.00},
    'Pizzalar': {'Pizza Margarita': 9.00, 'Pizza Meatlover': 13.00, 'Pizza Miks': 12.00, 'Pizza Chicken': 10.00},
    'Desertlər': {'Tiramisu': 5.00, 'San-Sebastian': 7.00, 'Sütlaç': 4.00, 'Türk paxlavası': 1.00},
    'Kabablar': {'Antrikot': 13.00, 'Lülə': 10.00, 'Adana': 10.00, 'Ciyər': 9.00, 'Tikə': 10.00, 'Tərəvəz kababı': 3.00},
    'Şorbalar': {'Mərci': 3.50, 'Toyuq şorbası': 4.00, 'Göbələk şorbası': 4.50, 'Yayla': 4.00},
    'Burger & Sendviçlər': {'Ət burger': 11.00, 'Toyuq burger': 10.00, 'Kids mini burger': 8.50, 'Klub sendviç': 8.50},
    'Salatlar': {'Sezar salatı toyuq': 8.50, 'Xırtıldayan badımcan': 6.50, 'Bakı salatı': 5.50, 'Çoban salatı': 4.50, 'Yunan salatı': 6.00},
    'Pastalar': {'Spaghetti Bolognese': 10.00, 'Fetuchini pasta': 10.00},
    'Pidələr': {'Qiyməli pide': 8.00, 'Pendirli pide': 8.00, 'Tərəvəzli pide': 7.00},
    'Lahmacun': {'Sadə': 3.00, 'Pendirli': 3.50, 'Acılı': 3.00, 'Qozlu': 4.00, 'Qarışıq': 4.50},
    'Klassik Kofelər': {'Americano': 5.00, 'Espresso': 4.00, 'Capuchino': 5.50, 'Raf': 6.00, 'Mocha': 6.50},
    'Limonadlar': {'Mango Marakhuya': 6.00, 'Çiyələkli limonad': 5.00, 'Nanə limonad': 5.00, 'Evsayağı limonad': 6.00, 'Şaftalı limonad': 5.00},
    'Ice Tea': {'Şaftalı ice tea': 4.50, 'Limon ice tea': 4.50, 'Çiyələkli ice tea': 4.50, 'Mango ice tea': 5.00},
    'Sərinləşdirici İçkilər': {'Ayran': 1.00, 'Evsayağı ayran': 2.00, 'Reyhan kompotu': 2.00, 'Okroşka': 3.00},
    'Özel Soyuq Dadlar': {'Frozen Çiyələkli': 6.00, 'Frozen Mango': 6.00, 'Frozen Şaftalı': 6.00},
    'Milkshakelər': {'Şokoladlı milkshake': 6.00, 'Çiyələkli milkshake': 6.00, 'Kakos milkshake': 6.00, 'Karamel milkshake': 6.00},
    'Moxitolar': {'Moxito Classik': 6.50, 'Moxito Çiyələkli': 6.50, 'Moxito Energy': 6.50}
};
const YEMEKLER = ['Dönərlər', 'Pizzalar', 'Kabablar', 'Şorbalar', 'Burger & Sendviçlər', 'Salatlar', 'Pastalar', 'Pidələr', 'Lahmacun', 'Desertlər'];
const ICKILER = ['Klassik Kofelər', 'Limonadlar', 'Ice Tea', 'Sərinləşdirici İçkilər', 'Özel Soyuq Dadlar', 'Milkshakelər', 'Moxitolar'];
const MEHSUL_KAT = {};
Object.entries(MENYU).forEach(([k, m]) => Object.keys(m).forEach(a => MEHSUL_KAT[a] = k));

// ==================== FIREBASE ====================
const FB = window.firebase;
const DR = (path) => FB.ref(FB.db, path);

const DATA = {
    isciler: [], masalar: [], sessiyalar: [], sifarisler: [],
    alislar: [], endirimler: [], sayac: {}, hazir: false
};

// ============================================================
// 🆕 TOAST — Gözəl bildirişlər
// ============================================================
function toast(mesaj, növ = 'success', müddət = 3000) {
    let wrap = document.querySelector('.toast-wrap');
    if (!wrap) {
        wrap = document.createElement('div');
        wrap.className = 'toast-wrap';
        document.body.appendChild(wrap);
    }
    const el = document.createElement('div');
    el.className = 'toast ' + növ;
    el.textContent = mesaj;
    wrap.appendChild(el);
    setTimeout(() => {
        el.classList.add('out');
        setTimeout(() => el.remove(), 350);
    }, müddət);
}

window.addEventListener('unhandledrejection', e => {
    toast('❌ Xəta: ' + ((e.reason && e.reason.message) || e.reason), 'error', 5000);
});

// ============================================================
// 🆕 CONFIRM — Gözəl təsdiq pəncərəsi
// ============================================================
function confirmDialog(mesaj, callback, başlıq = 'Təsdiq', icon = '❓') {
    const mövcud = document.getElementById('confirmModal');
    if (mövcud) mövcud.remove();

    const modal = document.createElement('div');
    modal.className = 'confirm-overlay';
    modal.id = 'confirmModal';
    modal.innerHTML = `
        <div class="confirm-box">
            <div class="confirm-icon">${icon}</div>
            <h3>${başlıq}</h3>
            <p>${mesaj}</p>
            <div class="confirm-buttons">
                <button class="confirm-btn yes">✅ Bəli</button>
                <button class="confirm-btn no">❌ Xeyr</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('.confirm-btn.yes').onclick = () => {
        modal.remove();
        callback(true);
    };
    modal.querySelector('.confirm-btn.no').onclick = () => {
        modal.remove();
        callback(false);
    };
}

// ============================================================
// 🆕 GOOGLE MAPS LİNKİ — Pulsuz, API açarı lazım deyil
// ============================================================
function xeriteyeBax(unvan) {
    if (!unvan || !unvan.trim()) {
        toast('❌ Ünvan yoxdur!', 'error');
        return;
    }
    const query = encodeURIComponent(unvan.trim());
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    window.open(url, '_blank');
}

// ==================== REAL-TIME DİNGLƏYİCİLƏR ====================
let _dinlemeBasladi = false;

function dinle() {
    if (_dinlemeBasladi) return;
    _dinlemeBasladi = true;

    const yollar = ['isciler', 'masalar', 'sessiyalar', 'sifarisler', 'alislar', 'endirimler', 'sayac'];
    let hazirSay = 0;

    yollar.forEach(yol => {
        FB.onValue(DR(yol), snap => {
            const v = snap.val();
            if (yol === 'sayac') {
                DATA.sayac = v || {};
            } else {
                DATA[yol] = v ? Object.values(v).filter(x => x && typeof x === 'object') : [];
            }
            hazirSay++;
            if (hazirSay === yollar.length && !DATA.hazir) {
                DATA.hazir = true;
                console.log('✅ Firebase hazırdır');
                ilkYukleme();
            } else if (DATA.hazir) {
                ekranYenile();
            }
        }, err => {
            toast('❌ Firebase xətası: ' + err.message, 'error', 8000);
        });
    });
}

async function ilkYukleme() {
    try {
        if (!DATA.isciler.length) {
            await FB.set(DR('isciler/1'), {id: 1, kod: '9999', ad: 'Admin', rol: 'admin'});
        }
        if (!DATA.masalar.length) {
            const masalar = {};
            for (let i = 1; i <= 12; i++) masalar[i] = {id: i, ad: 'Masa ' + i, nov: 'masa', status: 'bos'};
            for (let i = 1; i <= 2; i++) masalar[12 + i] = {id: 12 + i, ad: 'Kabinet ' + i, nov: 'kabinet', status: 'bos'};
            await FB.set(DR('masalar'), masalar);
        }
        if (!DATA.sayac || !DATA.sayac.sifaris) {
            await FB.set(DR('sayac'), {sifaris: 1, sessiya: 1, isci: 2, alis: 1, endirim: 1, paket: 1});
        }
    } catch (e) {
        console.error(e);
        toast('❌ Başlanğıc xətası: ' + e.message, 'error', 6000);
    }

    const user = istifadeciAl();
    if (user) panelGoster(user.rol);
    else loginPage();
}

function ekranYenile() {
    const user = istifadeciAl();
    if (!user) return;
    if (user.rol === 'admin' && document.getElementById('ad-container')) {
        const aktivTab = document.querySelector('#ad-container .tabs .tab.active');
        if (aktivTab) aktivTab.click();
    } else if (user.rol === 'ofisiant' && document.getElementById('of-container')) {
        if (!OF.masaId) of_masaSecimCiz();
    } else if (user.rol === 'kassir' && document.getElementById('ka-container')) {
        const aktivTab = document.querySelector('#ka-container .tabs .tab.active');
        if (aktivTab && aktivTab.textContent.includes('Paket')) paketCedveli('ka-p-paketler');
    } else if (user.rol === 'paketci' && document.getElementById('pk-container')) {
        if (!PK.sessiya) pk_render();
    }
}

// ==================== ID SAYACI ====================
async function yeniId(ad) {
    const s = DATA.sayac || {};
    const id = Number.isInteger(s[ad]) && s[ad] > 0 ? s[ad] : 1;
    await FB.set(DR('sayac/' + ad), id + 1);
    return id;
}

// ==================== KÖMƏKÇI ====================
const kodDuzgundur = k => /^\d+$/.test(k);
const adDuzgundur = a => /^[A-Za-zƏəÖöÜüĞğİıŞşÇç\s]+$/.test(a);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
const pad = n => String(n).padStart(2, '0');
const gun = d => { const x = new Date(d); return x.getFullYear() + '-' + pad(x.getMonth() + 1) + '-' + pad(x.getDate()); };
const bugun = () => gun(new Date());
const tarixFormat = d => d ? new Date(d).toLocaleString('az-AZ') : '—';
const cem = (arr, f) => arr.reduce((a, x) => a + f(x), 0);
const pul = n => (n || 0).toFixed(2) + ' ₼';
const saatFormat = b => {
    if (!b) return '00:00:00';
    const f = Math.floor((new Date() - new Date(b)) / 1000);
    if (f < 0) return '00:00:00';
    return pad(Math.floor(f / 3600)) + ':' + pad(Math.floor((f % 3600) / 60)) + ':' + pad(f % 60);
};

function istifadeciAl() {
    try {
        const a = JSON.parse(localStorage.getItem('resto_aktiv'));
        if (!a) return null;
        return DATA.isciler.find(i => i.id === a.id && i.kod === a.kod) || null;
    } catch { return null; }
}

// ==================== HTML ====================
function h(tag, attrs = {}, ...children) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
        if (k === 'className') el.className = v;
        else if (k === 'style') el.style.cssText = v;
        else if (k === 'onclick') el.onclick = v;
        else if (k === 'oninput') el.oninput = v;
        else if (k === 'onchange') el.onchange = v;
        else if (k === 'innerHTML') el.innerHTML = v;
        else if (v !== undefined && v !== null && v !== false) el.setAttribute(k, v);
    }
    children.flat().forEach(c => {
        if (c === null || c === undefined || c === false) return;
        el.appendChild(typeof c === 'object' ? c : document.createTextNode(String(c)));
    });
    return el;
}

// ==================== FON ====================
let cariFon = parseInt(localStorage.getItem('resto_bg')) || 1;
function fonYukle() {
    for (let i = 1; i <= 6; i++) document.body.classList.remove('bg-' + i);
    document.body.classList.add('bg-' + cariFon);
}
function bgDeyis() {
    cariFon = (cariFon % 6) + 1;
    fonYukle();
    localStorage.setItem('resto_bg', cariFon);
}

// ==================== TIMER ====================
let _timerInterval = null;
function timerBaslat() {
    if (_timerInterval) clearInterval(_timerInterval);
    const yenile = () => {
        document.querySelectorAll('.timer-saat, .aktiv-timer').forEach(el => {
            const b = el.getAttribute('data-baslama');
            if (!b) return;
            el.textContent = saatFormat(b);
            const f = Math.floor((new Date() - new Date(b)) / 60000);
            const p = el.closest('.masa-timer');
            if (p) {
                p.classList.remove('timer-warning', 'timer-danger');
                if (f >= 60) p.classList.add('timer-danger');
                else if (f >= 30) p.classList.add('timer-warning');
            }
        });
    };
    yenile();
    _timerInterval = setInterval(yenile, 1000);
}

let app;

// ==================== LOGIN ====================
let kodDeyeri = '', kodGizli = true;
const GOZ_GIZLI = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>';
const GOZ_ACIQ = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';

function reqemElave(r) { if (kodDeyeri.length >= 10) return; kodDeyeri += r; kodYenile(); }
function sonSil() { kodDeyeri = kodDeyeri.slice(0, -1); kodYenile(); }
function koduTemizle() { kodDeyeri = ''; kodYenile(); }
function kodYenile() {
    const el = document.getElementById('kodInput');
    if (el) el.value = kodGizli ? '•'.repeat(kodDeyeri.length) : kodDeyeri;
    const e = document.getElementById('err');
    if (e) e.textContent = '';
}
function kodGosterGizlet() {
    kodGizli = !kodGizli;
    const i = document.getElementById('gozIcon');
    if (i) i.innerHTML = kodGizli ? GOZ_GIZLI : GOZ_ACIQ;
    kodYenile();
}
function girisEt() {
    const e = document.getElementById('err');
    if (!kodDeyeri) { if (e) e.textContent = '❌ Kod daxil edin!'; return; }
    const isci = DATA.isciler.find(i => i.kod === kodDeyeri);
    if (!isci) {
        kodDeyeri = ''; kodYenile();
        if (e) e.textContent = '❌ Kod yanlışdır!';
        toast('❌ Kod yanlışdır!', 'error');
        return;
    }
    localStorage.setItem('resto_aktiv', JSON.stringify({id: isci.id, kod: isci.kod}));
    kodDeyeri = '';
    const saat = new Date().getHours();
    const salam = saat < 6 ? 'Gecəniz xeyrə' : saat < 12 ? 'Sabahınız xeyir' : saat < 18 ? 'Günortanız xeyir' : 'Axşamınız xeyir';
    toast(`👋 ${salam}, ${isci.ad}! Xoş gəldiniz`, 'success');
    panelGoster(isci.rol);
}
function cixisEt() {
    confirmDialog('Çıxış etmək istəyirsiniz?', cavab => {
        if (!cavab) return;
        localStorage.removeItem('resto_aktiv');
        location.reload();
    }, 'Çıxış', '🚪');
}

function panelGoster(rol) {
    app.innerHTML = '';
    fonYukle();
    if (rol === 'admin') adminPanel();
    else if (rol === 'kassir') kassirPanel();
    else if (rol === 'paketci') paketciPanel();
    else ofisiantPanel();
}

function loginPage() {
    app.innerHTML = '';
    const calc = h('div', {className: 'calc'});
    ['1', '2', '3', '4', '5', '6', '7', '8', '9'].forEach(n =>
        calc.appendChild(h('button', {className: 'calc-btn', onclick: () => reqemElave(n)}, n)));
    calc.appendChild(h('button', {className: 'calc-btn calc-temizle', onclick: koduTemizle}, 'C'));
    calc.appendChild(h('button', {className: 'calc-btn', onclick: () => reqemElave('0')}, '0'));
    calc.appendChild(h('button', {className: 'calc-btn calc-sil', onclick: sonSil}, '⌫'));

    const box = h('div', {className: 'login-box'},
        h('h1', {}, '🍽️ Restoran Sistemi'),
        h('p', {className: 'subtitle'}, 'Kodunuzu daxil edin'),
        h('div', {className: 'kod-display'},
            h('input', {type: 'text', id: 'kodInput', readonly: 'readonly', placeholder: '• • • •'}),
            h('button', {
                type: 'button', className: 'goz-btn', onclick: kodGosterGizlet,
                innerHTML: '<svg id="gozIcon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' + GOZ_GIZLI + '</svg>'
            })
        ),
        calc,
        h('button', {className: 'giris-btn', onclick: girisEt}, '🔓 Daxil ol'),
        h('p', {className: 'err', id: 'err'}),
        h('p', {style: 'color:#666;font-size:11px;margin-top:15px;'}, 'Admin: 9999 • Digər rollar admin təyin edir')
    );
    app.appendChild(h('div', {className: 'login-wrap'}, box));
}

function makeHeader(title, ad, rol) {
    const icons = {admin: '👨‍💼', kassir: '💰', ofisiant: '🍽️', paketci: '📦'};
    return h('div', {className: 'header'},
        h('h2', {}, title),
        h('div', {className: 'info'},
            h('span', {className: 'user-name'}, (icons[rol] || '') + ' ' + ad),
            h('button', {className: 'btn-out', onclick: cixisEt}, '🚪 Çıxış')
        )
    );
}

// ==================== MODALLAR ====================
function endirimModal(mebleg, callback) {
    const kohne = document.getElementById('endirimModal');
    if (kohne) kohne.remove();

    const faizInput = h('input', {type: 'number', placeholder: 'Endirim %', min: '0', max: '100', step: '1', value: '0'});
    const adInput = h('input', {type: 'text', placeholder: 'Müştəri adı (istəyə bağlı)'});
    const netice = h('div', {style: 'text-align:center;margin:15px 0;'});

    const faizAl = () => Math.min(100, Math.max(0, parseFloat(faizInput.value) || 0));
    const hesabla = () => {
        const faiz = faizAl(), endirim = mebleg * faiz / 100, yekun = mebleg - endirim;
        netice.innerHTML =
            `<div style="font-size:14px;color:#aaa;margin-bottom:5px;">Əvvəlki: ${pul(mebleg)}</div>` +
            `<div style="font-size:14px;color:#e94560;margin-bottom:5px;">Endirim (${faiz}%): -${pul(endirim)}</div>` +
            `<div style="font-size:26px;font-weight:bold;color:#2ecc71;">Yekun: ${pul(yekun)}</div>`;
    };
    faizInput.oninput = hesabla;

    const modal = h('div', {className: 'modal-overlay', id: 'endirimModal'},
        h('div', {className: 'modal-cek'},
            h('h3', {style: 'text-align:center;margin-bottom:15px;color:#e94560;'}, '💰 Endirim Tətbiq Et'),
            h('div', {style: 'display:flex;flex-direction:column;gap:10px;'},
                faizInput, adInput, netice,
                h('button', {className: 's-btn b-tamam', onclick: () => {
                    const faiz = faizAl(), endirim = mebleg * faiz / 100;
                    const data = {faiz, ad: adInput.value.trim(), endirim, yekun: mebleg - endirim, evvelki: mebleg};
                    modal.remove();
                    callback(data);
                }}, '✅ Təsdiqlə'),
                h('button', {className: 's-btn b-geri', onclick: () => { modal.remove(); callback(null); }}, '← Ləğv et')
            )
        )
    );
    document.body.appendChild(modal);
    modal.style.display = 'flex';
    hesabla();
}

function cekStilYukle() {
    if (document.getElementById('cekStil')) return;
    const st = document.createElement('style');
    st.id = 'cekStil';
    st.textContent = `
#cekModal .cek-ic{background:#fff!important;color:#000!important;font-family:'Courier New',monospace;font-size:13px;width:300px;max-width:100%;margin:0 auto;padding:16px 14px;border-radius:4px}
#cekModal .cek-ic *{color:#000!important;background:transparent!important}
#cekModal .cek-basliq{text-align:center}
#cekModal .cek-basliq h2{margin:0;font-size:18px;letter-spacing:3px}
#cekModal .cek-tarix{margin:4px 0 0;font-size:11px}
#cekModal .cek-xett{border-top:1px dashed #000;margin:8px 0}
#cekModal .cek-satir{display:flex;justify-content:space-between;gap:8px;padding:2px 0}
#cekModal .cek-qrup{font-weight:bold;text-decoration:underline;margin:6px 0 2px}
#cekModal .cek-toplam{font-weight:bold;font-size:15px;border-top:1px solid #000;margin-top:4px;padding-top:4px}
#cekModal .cek-tesekkur{text-align:center;margin:6px 0 0;font-size:12px}
@media print{
  body.cek-print{background:#fff!important}
  body.cek-print > *:not(#cekModal){display:none!important}
  body.cek-print #cekModal{position:static!important;display:block!important;background:#fff!important;padding:0!important}
  body.cek-print #cekModal .modal-cek{background:#fff!important;box-shadow:none!important;border:none!important;padding:0!important;max-width:none!important}
  body.cek-print #cekModal .cek-btnler{display:none!important}
}`;
    document.head.appendChild(st);
}

function cekBagla() {
    const m = document.getElementById('cekModal');
    if (m) m.remove();
    document.body.classList.remove('cek-print');
}

function cekCapEt() {
    document.body.classList.add('cek-print');
    window.addEventListener('afterprint', () => document.body.classList.remove('cek-print'), {once: true});
    setTimeout(() => window.print(), 300);
}

function cekGoster(sifarisler, basliq, meta, toplam, ed) {
    cekStilYukle();
    cekBagla();

    const satir = (a, b, ekstra = '') => `<div class="cek-satir ${ekstra}"><span>${a}</span><span>${b}</span></div>`;
    let html = `<div class="cek-basliq"><h2>RESTORAN</h2><p class="cek-tarix">${esc(new Date().toLocaleString('az-AZ'))}</p></div><div class="cek-xett"></div>`;
    html += satir('Başlıq:', `<b>${esc(basliq)}</b>`);
    if (meta) {
        if (meta.musteri_ad) html += satir('Müştəri:', `<b>${esc(meta.musteri_ad)}</b>`);
        if (meta.musteri_tel) html += satir('Telefon:', `<b>${esc(meta.musteri_tel)}</b>`);
        if (meta.unvan) html += satir('Ünvan:', `<b>${esc(meta.unvan)}</b>`);
        if (meta.isci_ad) html += satir('İşçi:', `<b>${esc(meta.isci_ad)}</b>`);
    }
    html += '<div class="cek-xett"></div>';

    const setir = s => {
        const ad = s.mehsul_ad || s.ad;
        const m = s.mebleg != null ? s.mebleg : s.q * s.miqdar;
        return satir(`${esc(ad)} x${s.miqdar}`, pul(m));
    };
    if (meta && meta.qrupla) {
        const ick = s => ICKILER.includes(MEHSUL_KAT[s.mehsul_ad || s.ad]);
        const yem = sifarisler.filter(s => !ick(s)), icl = sifarisler.filter(ick);
        if (yem.length) html += '<div class="cek-qrup">YEMEKLER</div>' + yem.map(setir).join('');
        if (icl.length) html += '<div class="cek-qrup">ICKILER</div>' + icl.map(setir).join('');
    } else {
        html += sifarisler.map(setir).join('');
    }
    html += '<div class="cek-xett"></div>';
    if (ed && ed.faiz > 0) {
        html += satir('Əvvəlki:', pul(ed.evvelki));
        html += satir(`Endirim (${ed.faiz}%):`, '-' + pul(ed.endirim));
        html += satir('YEKUN:', pul(ed.yekun), 'cek-toplam');
    } else {
        html += satir('TOPLAM:', pul(toplam), 'cek-toplam');
    }
    html += '<div class="cek-xett"></div><p class="cek-tesekkur">Təşəkkür edirik!</p>';

    const modal = h('div', {className: 'modal-overlay', id: 'cekModal'},
        h('div', {className: 'modal-cek'},
            h('div', {className: 'cek-ic', innerHTML: html}),
            h('div', {className: 'cek-btnler'}, h('button', {className: 's-btn b-geri', onclick: cekBagla}, '← Bağla'))
        )
    );
    document.body.appendChild(modal);
    modal.style.display = 'flex';
    cekCapEt();
}

function sessiyaCeki(sId, basliq) {
    const s = DATA.sessiyalar.find(x => x.id === sId);
    if (!s) return;
    const sif = DATA.sifarisler.filter(x => x.sessiya_id === sId);
    if (!sif.length) { toast('Sifariş yoxdur!', 'warning'); return; }
    const toplam = cem(sif, x => x.mebleg);
    const ed = s.endirim_mebleg > 0 ? {
        faiz: Math.round(s.endirim_mebleg / s.mebleg * 1000) / 10,
        evvelki: s.mebleg, endirim: s.endirim_mebleg, yekun: s.yekun, ad: s.endirim_ad
    } : null;
    cekGoster(sif, basliq, {
        musteri_ad: s.tip === 'paket' ? s.musteri_ad : '', musteri_tel: s.musteri_tel,
        unvan: s.unvan, isci_ad: s.isci_ad, qrupla: s.tip === 'paket'
    }, toplam, ed);
}

// ==================== SESSİYA / SİFARİŞ ====================
function aktivSessiya(masaId) {
    return DATA.sessiyalar.find(x => x.masa_id === masaId && x.status === 'aktiv' && x.tip === 'masa') || null;
}

async function sessiyaYarat(masaId, masaAd, tip, elave = {}) {
    const user = istifadeciAl();
    const id = await yeniId('sessiya');
    const paketNo = tip === 'paket' ? await yeniId('paket') : '';
    const sessiya = {
        id, masa_id: masaId, masa_ad: masaAd, tip,
        isci_id: user.id, isci_ad: user.ad,
        baslama: new Date().toISOString(), bitme: null,
        mebleg: 0, yekun: 0, endirim_faiz: 0, endirim_mebleg: 0, endirim_ad: '',
        status: 'aktiv',
        musteri_ad: elave.musteri_ad || '', musteri_tel: elave.musteri_tel || '', unvan: elave.unvan || '',
        paket_nomre: paketNo
    };
    await FB.set(DR('sessiyalar/' + id), sessiya);
    return sessiya;
}

async function sifarisElave(sessiyaId, masaId, masaAd, sebet) {
    const user = istifadeciAl();
    for (const item of sebet) {
        const sid = await yeniId('sifaris');
        await FB.set(DR('sifarisler/' + sid), {
            id: sid, sessiya_id: sessiyaId, masa_id: masaId, masa_ad: masaAd,
            isci_id: user.id, isci_ad: user.ad,
            mehsul_ad: item.ad, qiymet: item.q, miqdar: item.miqdar, mebleg: item.q * item.miqdar,
            tarix: new Date().toISOString()
        });
    }
}

async function sessiyaBagla(id) {
    const s = DATA.sessiyalar.find(x => x.id === id);
    if (!s) return;
    await FB.update(DR('sessiyalar/' + id), {status: 'bitdi', bitme: new Date().toISOString()});
    if (s.masa_id) {
        await FB.update(DR('masalar/' + s.masa_id), {status: 'bos'});
    }
}

// ============================================================
// MENYU + SƏBƏT MODULU
// ============================================================
function sebetPanel(S) {
    return h('div', {className: 'sebet'},
        h('h3', {}, '🛒 ' + (S.sebetBasliq || 'Səbət')),
        h('div', {id: S.p + '-sebetItems'}),
        h('div', {className: 'toplam'}, h('span', {}, 'Toplam:'), h('span', {id: S.p + '-toplam'}, '0.00 ₼'))
    );
}

function sebetYenile(S) {
    const el = document.getElementById(S.p + '-sebetItems');
    if (!el) return;
    el.innerHTML = '';

    const movcudSifarisler = S.sessiya
        ? DATA.sifarisler.filter(x => x.sessiya_id === S.sessiya.id)
        : [];

    const birlesdirilmis = {};
    movcudSifarisler.forEach(s => {
        if (!birlesdirilmis[s.mehsul_ad]) birlesdirilmis[s.mehsul_ad] = {ad: s.mehsul_ad, q: s.qiymet, miqdar: 0, kohne: 0};
        birlesdirilmis[s.mehsul_ad].miqdar += s.miqdar;
        birlesdirilmis[s.mehsul_ad].kohne += s.miqdar;
    });
    S.sebet.forEach(s => {
        if (!birlesdirilmis[s.ad]) birlesdirilmis[s.ad] = {ad: s.ad, q: s.q, miqdar: 0, kohne: 0};
        birlesdirilmis[s.ad].miqdar += s.miqdar;
    });

    const siyahi = Object.values(birlesdirilmis);
    if (!siyahi.length) {
        el.appendChild(h('p', {style: 'color:#aaa;text-align:center;padding:20px;'}, 'Səbət boşdur'));
    }

    const satir = (s, silineBiler) => h('div', {className: 's-item' + (s.kohne ? ' kohne-sifaris' : '')},
        h('div', {},
            `${s.ad} x${s.miqdar}`,
            s.kohne ? h('small', {style: 'display:block;color:#f39c12;font-size:11px;'}, `↳ əvvəlki: ${s.kohne}`) : null,
            h('br'),
            h('small', {style: 'color:#e94560;'}, pul(s.q * s.miqdar))
        ),
        silineBiler ? h('span', {className: 'sil', onclick: () => {
            const idx = S.sebet.findIndex(x => x.ad === s.ad);
            if (idx >= 0) S.sebet.splice(idx, 1);
            sebetYenile(S);
        }}, '✕') : null
    );

    if (S.tamKat) {
        const icki = s => ICKILER.includes(MEHSUL_KAT[s.ad]);
        [['🍽️ Yeməklər', '#f39c12', s => !icki(s)], ['🥤 İçkilər', '#3498db', icki]].forEach(([b, r, f]) => {
            const list = siyahi.filter(f);
            if (!list.length) return;
            el.appendChild(h('div', {style: `font-weight:bold;color:${r};margin:6px 0 2px;font-size:13px;`}, b));
            list.forEach(s => el.appendChild(satir(s, true)));
        });
    } else {
        siyahi.forEach(s => el.appendChild(satir(s, true)));
    }

    const movcudToplam = cem(movcudSifarisler, x => x.mebleg);
    const sebetToplam = cem(S.sebet, s => s.q * s.miqdar);
    const t = document.getElementById(S.p + '-toplam');
    if (t) t.textContent = pul(movcudToplam + sebetToplam);
}

function altDuymeler(S) {
    const duymeler = [
        h('button', {className: 's-btn b-tamam', onclick: () => sifarisTamamla(S, false)}, '📤 Sifarişi Tamamla'),
        h('button', {className: 's-btn b-cap', onclick: () => sifarisTamamla(S, true)}, '🖨️ Çek Çap Et')
    ];
    if (S.extra) duymeler.push(...S.extra());
    duymeler.push(h('button', {className: 's-btn b-geri', onclick: S.geri}, S.geriYazi || '← Masalar'));
    return h('div', {className: 'alt-duymeler'}, ...duymeler);
}

function esasMenyu(S) {
    const c = document.getElementById(S.cont);
    c.innerHTML = '';
    c.appendChild(h('div', {className: 'esas-header'},
        h('h3', {className: 's-title'}, 'Menyu — ' + S.masaAd),
        h('button', {className: 'btn-geri-ust', onclick: S.geri}, S.geriYazi || '← Masalar')
    ));
    c.appendChild(h('div', {className: 'menyu-wrap'},
        h('div', {},
            h('div', {className: 'esas-kats'},
                h('div', {className: 'esas-kat', onclick: () => katEkrani(S, 'yemekler')},
                    h('div', {className: 'esas-icon'}, '🍽️'), h('div', {className: 'esas-ad'}, 'Yeməklər'),
                    h('div', {className: 'esas-info'}, 'Dönər, Pizza, Kabab, Şorba')),
                h('div', {className: 'esas-kat', onclick: () => katEkrani(S, 'ickiler')},
                    h('div', {className: 'esas-icon'}, '🥤'), h('div', {className: 'esas-ad'}, 'İçkilər'),
                    h('div', {className: 'esas-info'}, 'Qəhvə, Limonad, Milkshake'))
            )
        ),
        sebetPanel(S)
    ));
    c.appendChild(altDuymeler(S));
    sebetYenile(S);
}

function katEkrani(S, grup) {
    const c = document.getElementById(S.cont);
    c.innerHTML = '';
    if (S.info) c.appendChild(S.info());
    const kats = grup === 'yemekler' ? YEMEKLER : grup === 'ickiler' ? ICKILER : YEMEKLER.concat(ICKILER);
    const basliq = grup === 'yemekler' ? '🍽️ Yeməklər' : grup === 'ickiler' ? '🥤 İçkilər' : '🍽️ Menyu';
    if (!S.tamKat) {
        c.appendChild(h('div', {className: 'alt-header'},
            h('button', {className: 'btn-geri', onclick: () => esasMenyu(S)}, '← Geri'),
            h('h3', {className: 's-title'}, basliq)
        ));
    }
    const tam = !!S.tamKat;
    const katsEl = h('div', tam ? {} : {className: 'kats'});
    const mehsEl = h('div', {className: 'mehsullar'});
    c.appendChild(h('div', {className: 'menyu-wrap'}, h('div', {}, katsEl, mehsEl), sebetPanel(S)));
    c.appendChild(altDuymeler(S));

    const sec = (k, btn) => {
        katsEl.querySelectorAll('.kat').forEach(b => b.classList.remove('active'));
        if (btn) btn.classList.add('active');
        mehsEl.innerHTML = '';
        const renk = ICKILER.includes(k) ? '#3498db' : '#f39c12';
        Object.entries(MENYU[k]).forEach(([ad, q]) => mehsEl.appendChild(
            h('div', {className: 'mehsul', style: tam ? `border-left:5px solid ${renk};` : '', onclick: () => {
                const m = S.sebet.find(x => x.ad === ad);
                if (m) m.miqdar++; else S.sebet.push({ad, q, miqdar: 1});
                sebetYenile(S);
                toast(`✅ ${ad} əlavə edildi`, 'success', 1500);
            }}, h('div', {className: 'ad'}, ad), h('div', {className: 'q'}, pul(q)))
        ));
    };
    let ilk = null;
    const qrupCiz = (host, siyahi, renk) => siyahi.forEach(k => {
        const b = h('button', {className: 'kat', style: tam ? `border:2px solid ${renk};` : '', onclick: () => sec(k, b)}, k);
        if (!ilk) ilk = b;
        host.appendChild(b);
    });
    if (tam) {
        katsEl.appendChild(h('div', {style: 'font-weight:bold;color:#f39c12;margin:4px 0;'}, '🍽️ Yeməklər'));
        const y = h('div', {className: 'kats'}); katsEl.appendChild(y); qrupCiz(y, YEMEKLER, '#f39c12');
        katsEl.appendChild(h('div', {style: 'font-weight:bold;color:#3498db;margin:12px 0 4px;'}, '🥤 İçkilər'));
        const i = h('div', {className: 'kats'}); katsEl.appendChild(i); qrupCiz(i, ICKILER, '#3498db');
    } else {
        qrupCiz(katsEl, kats, '');
    }
    sec(kats[0], ilk);
    sebetYenile(S);
}

function masaCekiVeBagla(S, sId) {
    sessiyaCeki(sId, S.masaAd);
    setTimeout(() => {
        sessiyaBagla(sId);
        S.sessiya = null; S.sebet = [];
        S.geri();
    }, 1000);
}

function sifarisTamamla(S, cek) {
    const masaCek = cek && S.masaId;

    if (!S.sebet.length) {
        if (!masaCek) { toast('Səbət boşdur!', 'warning'); return; }
        const s = aktivSessiya(S.masaId);
        if (!s || !DATA.sifarisler.some(x => x.sessiya_id === s.id)) { toast('Səbət boşdur!', 'warning'); return; }
        if (S.sahibmi && !S.sahibmi(s)) { toast('🔒 Bu masa ' + s.isci_ad + ' tərəfindən açılıb!', 'error'); return; }
        return masaCekiVeBagla(S, s.id);
    }
    const toplam = cem(S.sebet, x => x.q * x.miqdar);

    endirimModal(toplam, async ed => {
        if (!ed) return;
        try {
            const s0 = await S.hazirla();
            if (!s0) return;
            S.sessiya = s0;
            const user = istifadeciAl();

            await sifarisElave(s0.id, S.masaId, S.masaAd, S.sebet);

            const s = DATA.sessiyalar.find(x => x.id === s0.id) || s0;
            const yeniMebleg = (s.mebleg || 0) + toplam;
            const yeniYekun = (s.yekun || 0) + ed.yekun;
            const yeniEndirim = (s.endirim_mebleg || 0) + ed.endirim;
            await FB.update(DR('sessiyalar/' + s0.id), {
                mebleg: yeniMebleg,
                yekun: yeniYekun,
                endirim_mebleg: yeniEndirim,
                endirim_faiz: yeniMebleg ? Math.round(yeniEndirim / yeniMebleg * 1000) / 10 : 0,
                endirim_ad: ed.ad || s.endirim_ad || ''
            });

            if (S.masaId) {
                await FB.update(DR('masalar/' + S.masaId), {status: 'dolu'});
            }

            if (ed.faiz > 0) {
                const eid = await yeniId('endirim');
                await FB.set(DR('endirimler/' + eid), {
                    id: eid, tip: S.masaId ? 'masa' : 'paket',
                    masa_ad: S.masaId ? S.masaAd : 'Paket #' + s0.paket_nomre,
                    musteri_ad: ed.ad || s0.musteri_ad || '(ad yoxdur)',
                    faiz: ed.faiz, evvelki: toplam, endirim: ed.endirim, yekun: ed.yekun,
                    isci_id: user.id, isci_ad: user.ad, tarix: new Date().toISOString()
                });
            }

            S.sebet = [];
            toast('✅ Sifariş göndərildi! Yekun: ' + pul(ed.yekun), 'success');
            if (cek) {
                if (S.masaId) masaCekiVeBagla(S, s0.id);
                else { sessiyaCeki(s0.id, 'Paket #' + s0.paket_nomre); S.ekran(); }
            } else {
                S.geri();
            }
        } catch (err) {
            console.error(err);
            toast('❌ Sifariş xətası: ' + err.message, 'error', 5000);
        }
    });
}

// ============================================================
// OFİSİANT
// ============================================================
const OF = {
    p: 'of', cont: 'of-container', masaId: null, masaAd: '', sessiya: null, sebet: [],
    geri: () => of_masaSecimCiz(),
    ekran: () => esasMenyu(OF),
    meta: () => ({isci_ad: istifadeciAl().ad}),
    hazirla: async () => {
        const s = aktivSessiya(OF.masaId);
        if (s && s.isci_id !== istifadeciAl().id) {
            toast('🔒 Bu masa ' + s.isci_ad + ' tərəfindən açılıb!', 'error');
            of_masaSecimCiz();
            return null;
        }
        return s || await sessiyaYarat(OF.masaId, OF.masaAd, 'masa');
    },
    sahibmi: s => s.isci_id === istifadeciAl().id
};

function ofisiantPanel() {
    const i = istifadeciAl();
    app.appendChild(makeHeader('🍽️ Ofisiant Paneli', i.ad, 'ofisiant'));
    app.appendChild(h('div', {className: 'container', id: 'of-container'}));
    of_masaSecimCiz();
}

function masaKartlari(c, idPrefix, ciz) {
    const masalar = DATA.masalar;
    c.appendChild(h('h3', {className: 's-title'}, '🍽️ Masa seçin'));
    const mg = h('div', {className: 'masalar', id: idPrefix + '-masalarGrid'});
    c.appendChild(mg);
    c.appendChild(h('h3', {className: 's-title', style: 'margin-top:45px;'}, '🚪 Kabinet seçin'));
    const kg = h('div', {className: 'masalar kabinetler', id: idPrefix + '-kabinetlerGrid'});
    c.appendChild(kg);
    masalar.filter(m => m.nov === 'masa').sort((a, b) => a.id - b.id).forEach(m => mg.appendChild(ciz(m)));
    masalar.filter(m => m.nov === 'kabinet').sort((a, b) => a.id - b.id).forEach(m => kg.appendChild(ciz(m)));
    timerBaslat();
}

function of_masaSecimCiz() {
    const c = document.getElementById('of-container');
    if (!c) return;
    c.innerHTML = '';
    OF.masaId = null;
    const user = istifadeciAl();
    const sessiyalar = DATA.sessiyalar;

    masaKartlari(c, 'of', m => {
        const s = sessiyalar.find(x => x.masa_id === m.id && x.status === 'aktiv' && x.tip === 'masa');
        const basqa = s && s.isci_id !== user.id;
        const ozum = s && s.isci_id === user.id;

        let klass = 'masa', st = '🟢 Boş', stil = '';
        if (s) { klass += ' dolu'; st = '🔴 Dolu'; }
        if (ozum) { klass += ' ozum'; st = '👤 Sizin'; }
        if (basqa) { klass += ' bagli'; st = '🔒 Bağlı'; stil = 'opacity:.45;cursor:not-allowed;filter:grayscale(.6);'; }

        const div = h('div', {className: klass, style: stil}, h('div', {className: 'ad'}, m.ad), h('div', {className: 'st'}, st));
        if (s) {
            div.appendChild(h('div', {className: 'isci-ad'}, '👤 ' + s.isci_ad));
            div.appendChild(h('div', {className: 'masa-timer'}, h('span', {}, '⏱️'),
                h('span', {className: 'timer-saat', 'data-baslama': s.baslama}, '00:00:00')));
        }
        div.addEventListener('click', () => {
            if (basqa) { toast('🔒 Bu masa ' + s.isci_ad + ' tərəfindən açılıb!', 'error'); return; }
            of_masaSec(m.id);
        });
        return div;
    });
}

function of_masaSec(id) {
    const masa = DATA.masalar.find(m => m.id === id);
    const s = aktivSessiya(id);
    if (s && s.isci_id !== istifadeciAl().id) { toast('🔒 Bu masa ' + s.isci_ad + ' tərəfindən açılıb!', 'error'); return; }
    OF.masaId = masa.id; OF.masaAd = masa.ad; OF.sessiya = s; OF.sebet = [];
    esasMenyu(OF);
}

// ============================================================
// PAKETÇİ
// ============================================================
const PK = {
    p: 'pk', cont: 'pk-container', tamKat: true, masaId: null, masaAd: 'Paket', sessiya: null, sebet: [],
    sebetBasliq: 'Paket Səbəti', geriYazi: '← Paketlərə qayıt',
    geri: () => pk_render(),
    ekran: () => katEkrani(PK, null),
    meta: () => ({
        musteri_ad: PK.sessiya.musteri_ad, musteri_tel: PK.sessiya.musteri_tel,
        unvan: PK.sessiya.unvan, isci_ad: PK.sessiya.isci_ad
    }),
    hazirla: async () => {
        const s = PK.sessiya && DATA.sessiyalar.find(x => x.id === PK.sessiya.id);
        if (!s || s.status !== 'aktiv') { toast('❌ Bu paket artıq bağlıdır!', 'error'); pk_render(); return null; }
        return s;
    },
    info: () => h('div', {style: 'padding:15px;background:rgba(243,156,18,0.15);border-radius:10px;margin-bottom:20px;border:1px solid rgba(243,156,18,0.3);'},
        h('div', {style: 'font-size:14px;line-height:1.8;'},
            h('div', {style: 'font-weight:bold;color:#f39c12;'}, '📦 Paket #' + PK.sessiya.paket_nomre),
            h('div', {}, '👤 ' + (PK.sessiya.musteri_ad || '-')),
            h('div', {}, '📞 ' + (PK.sessiya.musteri_tel || '-')),
            h('div', {}, '📍 ' + (PK.sessiya.unvan || '-'))
        )),
};

function paketciPanel() {
    const i = istifadeciAl();
    app.appendChild(makeHeader('📦 Paketçi Paneli', i.ad, 'paketci'));
    app.appendChild(h('div', {className: 'container', id: 'pk-container'}));
    pk_render();
}

function pk_render() {
    const c = document.getElementById('pk-container');
    if (!c) return;
    c.innerHTML = '';
    const user = istifadeciAl();
    const paketler = DATA.sessiyalar.filter(s => s.tip === 'paket' && s.isci_id === user.id);

    c.appendChild(h('div', {className: 'esas-header'},
        h('h3', {className: 's-title'}, '📦 Paket Sifarişləri'),
        h('button', {className: 'btn-geri-ust', onclick: pk_yeniPaket}, '➕ Yeni Paket')
    ));
    if (!paketler.length) {
        c.appendChild(h('p', {style: 'text-align:center;color:#aaa;padding:40px;'}, '📦 Paket yoxdur'));
        return;
    }

    paketler.slice().sort((a, b) => b.id - a.id).forEach(p => {
        const sif = DATA.sifarisler.filter(x => x.sessiya_id === p.id)
            .sort((a, b) => ICKILER.includes(MEHSUL_KAT[a.mehsul_ad]) - ICKILER.includes(MEHSUL_KAT[b.mehsul_ad]));
        const aktiv = p.status === 'aktiv';

        const siyahi = h('div', {style: 'margin-top:15px;padding:15px;background:rgba(0,0,0,0.3);border-radius:10px;'},
            h('h4', {style: 'color:#f39c12;margin-bottom:10px;'}, '📋 Sifarişlər'),
            !sif.length
                ? h('p', {style: 'color:#aaa;font-size:13px;'}, 'Sifariş yoxdur')
                : h('table', {style: 'width:100%;'},
                    h('thead', {}, h('tr', {}, h('th', {}, 'Məhsul'), h('th', {}, 'Miqdar'), h('th', {}, 'Qiymət'), h('th', {}, 'Məbləğ'))),
                    h('tbody', {}, ...sif.map(x => h('tr', {},
                        h('td', {}, (ICKILER.includes(MEHSUL_KAT[x.mehsul_ad]) ? '🥤 ' : '🍽️ ') + x.mehsul_ad), h('td', {}, x.miqdar), h('td', {}, pul(x.qiymet)),
                        h('td', {style: 'color:#e94560;font-weight:bold;'}, pul(x.mebleg))))))
        );

        const btnler = aktiv
            ? h('div', {className: 'aktiv-masa-btnler'},
                h('button', {className: 'small-btn', style: 'background:#3498db;', onclick: () => pk_menyuAc(p.id)}, '🍽️ Sifarişə davam et'),
                h('button', {className: 'small-btn', style: 'background:#27ae60;', onclick: () => sessiyaCeki(p.id, 'Paket #' + p.paket_nomre)}, '🖨️ Çek göstər'),
                h('button', {className: 'small-btn', style: 'background:#e74c3c;', onclick: () => pk_bagla(p.id)}, '✅ Bağla'))
            : h('div', {className: 'aktiv-masa-btnler'},
                h('span', {style: 'color:#2ecc71;'}, '🟢 Bağlı'),
                h('button', {className: 'small-btn', style: 'background:#27ae60;', onclick: () => sessiyaCeki(p.id, 'Paket #' + p.paket_nomre)}, '🖨️ Çek göstər'));

        c.appendChild(h('div', {className: 'aktiv-masa-kart', style: 'border-color:rgba(243,156,18,0.5);'},
            h('div', {className: 'aktiv-masa-header'},
                h('div', {},
                    h('div', {className: 'aktiv-masa-ad', style: 'color:#f39c12;'}, '📦 Paket #' + p.paket_nomre),
                    h('div', {className: 'aktiv-masa-info'}, '👤 ' + (p.musteri_ad || '-') + ' · 📞 ' + (p.musteri_tel || '-')),
                    h('div', {className: 'aktiv-masa-info', style: 'margin-top:5px;color:#f39c12;'}, '📍 ' + (p.unvan || '-'))
                ),
                h('div', {className: 'aktiv-masa-mebleg'}, pul(p.yekun))
            ),
            siyahi,
            h('div', {style: 'display:flex; gap:8px; flex-wrap:wrap; margin-top:10px;'},
                h('button', {
                    className: 'small-btn',
                    style: 'background: linear-gradient(135deg, #4285f4, #34a853); color: #fff;',
                    onclick: () => xeriteyeBax(p.unvan)
                }, '📍 Xəritədə Göstər')
            ),
            btnler
        ));
    });
}

// ============================================================
// 🆕 YENİ PAKET FORMASI — Ağ boşluqlar, hamısı məcburi
// ============================================================
async function pk_yeniPaket() {
    const kohne = document.getElementById('yeniPaketModal');
    if (kohne) kohne.remove();

    const modal = h('div', {className: 'modal-overlay', id: 'yeniPaketModal'},
        h('div', {className: 'modal-cek', style: 'max-width: 420px;'},
            h('h3', {style: 'text-align:center; margin-bottom:20px; color:#f39c12; font-size:20px;'}, '📦 Yeni Paket Sifarişi'),
            h('div', {style: 'display:flex; flex-direction:column; gap:14px;'},
                h('div', {},
                    h('label', {style: 'display:block; font-size:13px; color:#aaa; margin-bottom:5px; font-weight:600;'}, '👤 Müştəri adı *'),
                    h('input', {
                        type: 'text', id: 'pk-ad', placeholder: 'Məsələn: Əli Məmmədov',
                        style: 'width:100%; padding:12px 15px; border-radius:10px; border:1px solid rgba(255,255,255,0.4); background:#ffffff; color:#000; font-size:15px; outline:none;'
                    })
                ),
                h('div', {},
                    h('label', {style: 'display:block; font-size:13px; color:#aaa; margin-bottom:5px; font-weight:600;'}, '📞 Telefon *'),
                    h('input', {
                        type: 'tel', id: 'pk-tel', placeholder: 'Məsələn: 0501234567',
                        style: 'width:100%; padding:12px 15px; border-radius:10px; border:1px solid rgba(255,255,255,0.4); background:#ffffff; color:#000; font-size:15px; outline:none;'
                    })
                ),
                h('div', {},
                    h('label', {style: 'display:block; font-size:13px; color:#aaa; margin-bottom:5px; font-weight:600;'}, '📍 Ünvan *'),
                    h('input', {
                        type: 'text', id: 'pk-unvan', placeholder: 'Məsələn: Nizami küç. 15, mənzil 8',
                        style: 'width:100%; padding:12px 15px; border-radius:10px; border:1px solid rgba(255,255,255,0.4); background:#ffffff; color:#000; font-size:15px; outline:none;'
                    })
                ),
                h('p', {style: 'font-size:11px; color:#888; margin:0;'}, '* - Bütün sahələr məcburidir'),
                h('button', {
                    className: 's-btn b-tamam',
                    onclick: async () => {
                        const ad = document.getElementById('pk-ad').value.trim();
                        const tel = document.getElementById('pk-tel').value.trim();
                        const unvan = document.getElementById('pk-unvan').value.trim();
                        
                        if (!ad) { toast('❌ Müştəri adı lazımdır!', 'error'); document.getElementById('pk-ad').focus(); return; }
                        if (!tel) { toast('❌ Telefon nömrəsi lazımdır!', 'error'); document.getElementById('pk-tel').focus(); return; }
                        if (!unvan) { toast('❌ Ünvan lazımdır!', 'error'); document.getElementById('pk-unvan').focus(); return; }
                        
                        modal.remove();
                        try {
                            const s = await sessiyaYarat(null, 'Paket', 'paket', {musteri_ad: ad, musteri_tel: tel, unvan});
                            toast('✅ Paket yaradıldı: #' + s.paket_nomre, 'success');
                            setTimeout(() => pk_menyuAc(s.id), 300);
                        } catch (err) {
                            toast('❌ Xəta: ' + err.message, 'error', 5000);
                        }
                    }
                }, '✅ Paketi Yarat'),
                h('button', {
                    className: 's-btn b-geri',
                    onclick: () => modal.remove()
                }, '← Ləğv et')
            )
        )
    );
    document.body.appendChild(modal);
    modal.style.display = 'flex';

    setTimeout(() => document.getElementById('pk-ad')?.focus(), 100);

    modal.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            e.preventDefault();
            modal.querySelector('.s-btn.b-tamam').click();
        }
        if (e.key === 'Escape') modal.remove();
    });
}

function pk_menyuAc(id) {
    const s = DATA.sessiyalar.find(x => x.id === id);
    if (!s || s.status !== 'aktiv') { toast('❌ Paket tapılmadı və ya bağlıdır!', 'error'); pk_render(); return; }
    PK.sessiya = s;
    PK.sebet = [];
    katEkrani(PK, null);
}

async function pk_bagla(id) {
    confirmDialog('Paketi bağlamaq istəyirsiniz?', async cavab => {
        if (!cavab) return;
        try {
            await sessiyaBagla(id);
            if (PK.sessiya && PK.sessiya.id === id) { PK.sessiya = null; PK.sebet = []; }
            toast('✅ Paket bağlandı', 'success');
        } catch (err) {
            toast('❌ Xəta: ' + err.message, 'error', 5000);
        }
        pk_render();
    }, 'Paketi bağla', '📦');
}

// ============================================================
// KASSİR
// ============================================================
const KA = {
    p: 'ka', cont: 'ka-p-masalar', masaId: null, masaAd: '', sessiya: null, sebet: [],
    geri: () => ka_renderMasalar(),
    ekran: () => esasMenyu(KA),
    meta: () => ({isci_ad: istifadeciAl().ad}),
    hazirla: async () => aktivSessiya(KA.masaId) || await sessiyaYarat(KA.masaId, KA.masaAd, 'masa'),
};

function kassirPanel() {
    const i = istifadeciAl();
    app.appendChild(makeHeader('💰 Kassir Paneli', i.ad, 'kassir'));
    app.appendChild(h('div', {className: 'container', id: 'ka-container'}));
    ka_render();
}

function ka_render() {
    const c = document.getElementById('ka-container');
    c.innerHTML = '';
    c.appendChild(h('div', {className: 'tabs'},
        h('button', {className: 'tab active', onclick: e => ka_tabSec('masalar', e.target)}, '🍽️ Masalar'),
        h('button', {className: 'tab', onclick: e => ka_tabSec('paketler', e.target)}, '📦 Paketlər'),
        h('button', {className: 'tab', onclick: e => ka_tabSec('alislar', e.target)}, '🛒 Alışlar')
    ));
    c.appendChild(h('div', {className: 'panel active', id: 'ka-p-masalar'}));
    c.appendChild(h('div', {className: 'panel', id: 'ka-p-paketler'}));
    c.appendChild(h('div', {className: 'panel', id: 'ka-p-alislar'}));
    ka_renderMasalar();
    paketCedveli('ka-p-paketler');
    ka_renderAlislar();
}

function ka_tabSec(tab, btn) {
    document.querySelectorAll('#ka-container .tabs .tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    ['masalar', 'paketler', 'alislar'].forEach(t => document.getElementById('ka-p-' + t).classList.toggle('active', t === tab));
    if (tab === 'paketler') paketCedveli('ka-p-paketler');
}

function ka_renderMasalar() {
    const c = document.getElementById('ka-p-masalar');
    if (!c) return;
    c.innerHTML = '';
    const user = istifadeciAl();
    KA.masaId = null;

    masaKartlari(c, 'ka', m => {
        const s = DATA.sessiyalar.find(x => x.masa_id === m.id && x.status === 'aktiv' && x.tip === 'masa');
        let klass = 'masa', st = '🟢 Boş';
        if (s) { klass += ' dolu'; st = '🔴 Dolu'; }
        if (s && s.isci_id === user.id) { klass += ' ozum'; st = '👤 Sizin'; }
        const div = h('div', {className: klass}, h('div', {className: 'ad'}, m.ad), h('div', {className: 'st'}, st));
        if (s) {
            div.appendChild(h('div', {className: 'isci-ad'}, '👤 ' + s.isci_ad));
            div.appendChild(h('div', {className: 'masa-timer'}, h('span', {}, '⏱️'),
                h('span', {className: 'timer-saat', 'data-baslama': s.baslama}, '00:00:00')));
        }
        div.addEventListener('click', () => ka_masaSec(m.id));
        return div;
    });
}

function ka_masaSec(id) {
    const masa = DATA.masalar.find(m => m.id === id);
    KA.masaId = masa.id; KA.masaAd = masa.ad; KA.sessiya = aktivSessiya(id); KA.sebet = [];
    esasMenyu(KA);
}

function paketCedveli(id) {
    const c = document.getElementById(id);
    if (!c) return;
    c.innerHTML = '';
    c.appendChild(h('h3', {className: 's-title'}, '📦 Bütün Paket Sifarişləri'));
    const paketler = DATA.sessiyalar.filter(s => s.tip === 'paket');
    const tbody = h('tbody', {});
    if (!paketler.length) {
        tbody.appendChild(h('tr', {}, h('td', {colspan: '9', style: 'text-align:center;color:#aaa;padding:20px;'}, 'Paket yoxdur')));
    }
    paketler.slice().sort((a, b) => b.id - a.id).forEach(p => tbody.appendChild(h('tr', {},
        h('td', {}, h('b', {style: 'color:#f39c12;'}, '#' + p.paket_nomre)),
        h('td', {}, p.musteri_ad || '-'), h('td', {}, p.musteri_tel || '-'), h('td', {}, p.unvan || '-'), h('td', {}, p.isci_ad),
        h('td', {style: 'color:#2ecc71;font-weight:bold;'}, pul(p.yekun)),
        h('td', {style: p.endirim_mebleg > 0 ? 'color:#e94560;' : ''},
            p.endirim_mebleg > 0 ? `-${p.endirim_faiz}% (${p.endirim_ad || '-'})` : '-'),
        h('td', {}, p.status === 'aktiv' ? '🟡 Aktiv' : '🟢 Bağlı'),
        h('td', {}, tarixFormat(p.baslama))
    )));
    c.appendChild(h('table', {},
        h('thead', {}, h('tr', {}, ...['Nömrə', 'Müştəri', 'Telefon', 'Ünvan', 'İşçi', 'Məbləğ', 'Endirim', 'Status', 'Tarix'].map(t => h('th', {}, t)))),
        tbody));
}

function ka_renderAlislar() {
    const c = document.getElementById('ka-p-alislar');
    c.innerHTML = '';
    c.appendChild(h('h3', {className: 's-title'}, '🛒 Restoran Alışları'));
    c.appendChild(h('div', {className: 'form'},
        h('input', {type: 'text', id: 'ka-malAd', placeholder: 'Mal adı'}),
        h('input', {type: 'number', id: 'ka-malQiymet', placeholder: 'Qiymət', step: '0.01'}),
        h('input', {type: 'number', id: 'ka-malMiqdar', placeholder: 'Miqdar', value: '1'}),
        h('input', {type: 'text', id: 'ka-malQeyd', placeholder: 'Qeyd'}),
        h('button', {onclick: ka_alisElave}, '+ Alış əlavə et'),
        h('button', {style: 'background:#27ae60;', onclick: () => window.print()}, '🖨️ Çap et')
    ));
    c.appendChild(h('div', {className: 'stats'},
        h('div', {className: 'stat'}, h('div', {className: 'v', id: 'ka-alisCemi'}, '0.00 ₼'), h('div', {className: 'l'}, 'Günlük Cəmi')),
        h('div', {className: 'stat'}, h('div', {className: 'v', id: 'ka-alisSayi'}, '0'), h('div', {className: 'l'}, 'Alış Sayı'))
    ));
    c.appendChild(h('table', {},
        h('thead', {}, h('tr', {}, ...['Mal', 'Qiymət', 'Miqdar', 'Cəmi', 'Qeyd', 'Tarix'].map(t => h('th', {}, t)))),
        h('tbody', {id: 'ka-alisTable'})
    ));
    ka_alislariYukle();
}

function ka_alislariYukle() {
    const t = bugun();
    const alislar = DATA.alislar.filter(a => gun(a.tarix) === t);
    const el1 = document.getElementById('ka-alisCemi');
    const el2 = document.getElementById('ka-alisSayi');
    const tb = document.getElementById('ka-alisTable');
    if (!tb) return;
    if (el1) el1.textContent = pul(cem(alislar, x => x.cemi));
    if (el2) el2.textContent = alislar.length;
    tb.innerHTML = '';
    if (!alislar.length) {
        tb.appendChild(h('tr', {}, h('td', {colspan: '6', style: 'text-align:center;color:#aaa;padding:20px;'}, 'Alış yoxdur')));
        return;
    }
    alislar.forEach(a => tb.appendChild(h('tr', {},
        h('td', {}, a.mal_ad), h('td', {}, pul(a.qiymet)), h('td', {}, a.miqdar),
        h('td', {style: 'color:#2ecc71;font-weight:bold;'}, pul(a.cemi)), h('td', {}, a.qeyd || '-'), h('td', {}, tarixFormat(a.tarix)))));
}

async function ka_alisElave() {
    const mal_ad = document.getElementById('ka-malAd').value.trim();
    const qiymet = parseFloat(document.getElementById('ka-malQiymet').value);
    const miqdar = parseInt(document.getElementById('ka-malMiqdar').value) || 1;
    const qeyd = document.getElementById('ka-malQeyd').value.trim();
    if (!mal_ad || !qiymet) { toast('Mal adı və qiymət lazımdır!', 'error'); return; }
    try {
        const user = istifadeciAl();
        const aid = await yeniId('alis');
        await FB.set(DR('alislar/' + aid), {
            id: aid, mal_ad, qiymet, miqdar, cemi: qiymet * miqdar, qeyd,
            isci_id: user.id, isci_ad: user.ad, tarix: new Date().toISOString()
        });
        ['ka-malAd', 'ka-malQiymet', 'ka-malQeyd'].forEach(i => document.getElementById(i).value = '');
        document.getElementById('ka-malMiqdar').value = '1';
        toast('✅ Alış əlavə edildi!', 'success');
        ka_alislariYukle();
    } catch (err) {
        toast('❌ Xəta: ' + err.message, 'error', 5000);
    }
}

// ============================================================
// ADMİN
// ============================================================
let charts = {};
const AD_TABS = [
    ['isciler', '👥 İşçilər'], ['aktiv', '📋 Aktiv Masalar'],
    ['alislar', '🛒 Alışlar'], ['endirimler', '💰 Endirimlər'],
    ['hesabat', '📊 Hesabat'], ['qrafikler', '📈 Qrafiklər'],
    ['ayarlar', '⚙️ Ayarlar'], ['sifirla', '🗑️ Sıfırla']
];

function adminPanel() {
    const i = istifadeciAl();
    app.appendChild(makeHeader('👨‍💼 Admin Paneli', i.ad, 'admin'));
    app.appendChild(h('div', {className: 'container', id: 'ad-container'}));
    if (typeof Chart !== 'undefined') {
        Chart.defaults.color = '#ccc';
        Chart.defaults.borderColor = 'rgba(255,255,255,0.1)';
    }
    ad_render();
}

function ad_render() {
    const c = document.getElementById('ad-container');
    c.innerHTML = '';
    const tabs = h('div', {className: 'tabs'});
    AD_TABS.forEach(([k, l], i) => tabs.appendChild(
        h('button', {className: 'tab' + (i === 0 ? ' active' : ''), onclick: e => ad_tabSec(k, e.target)}, l)));
    c.appendChild(tabs);
    AD_TABS.forEach(([k], i) => c.appendChild(h('div', {className: 'panel' + (i === 0 ? ' active' : ''), id: 'ad-p-' + k})));
    ad_renderIsciler(); ad_renderAktiv(); ad_renderAlislar();
    ad_renderEndirimler(); ad_renderHesabat();
    ad_renderQrafikler(); ad_renderAyarlar(); ad_renderSifirla();
}

function ad_tabSec(tab, btn) {
    document.querySelectorAll('#ad-container .tabs .tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    AD_TABS.forEach(([t]) => document.getElementById('ad-p-' + t).classList.toggle('active', t === tab));
    if (tab === 'qrafikler') setTimeout(ad_qrafikYukle, 100);
    if (tab === 'sifirla') ad_sifirlaStatistika();
    if (tab === 'aktiv') ad_aktivMasalariYukle();
}

// İŞÇİLƏR
function ad_renderIsciler() {
    const c = document.getElementById('ad-p-isciler');
    c.innerHTML = '';
    c.appendChild(h('h3', {className: 's-title'}, 'İşçi Əlavə Et'));
    c.appendChild(h('div', {className: 'form'},
        h('input', {type: 'text', id: 'yeniKod', placeholder: 'Kod', maxlength: '10'}),
        h('input', {type: 'text', id: 'yeniAd', placeholder: 'Ad'}),
        h('select', {id: 'yeniRol'},
            h('option', {value: 'ofisiant'}, 'Ofisiant'), h('option', {value: 'kassir'}, 'Kassir'), h('option', {value: 'paketci'}, 'Paketçi')),
        h('button', {onclick: ad_isciElaveEt}, '+ Əlavə et'),
        h('button', {style: 'background:#27ae60;', onclick: () => window.print()}, '🖨️ Çap et')
    ));
    c.appendChild(h('table', {},
        h('thead', {}, h('tr', {}, h('th', {}, 'Kod'), h('th', {}, 'Ad'), h('th', {}, 'Rol'), h('th', {}, 'Əməliyyat'))),
        h('tbody', {id: 'ad-iscilerTable'})));
    ad_iscileriYukle();
}

function ad_iscileriYukle() {
    const isciler = DATA.isciler.filter(i => i.rol !== 'admin');
    const tb = document.getElementById('ad-iscilerTable');
    if (!tb) return;
    tb.innerHTML = '';
    if (!isciler.length) {
        tb.appendChild(h('tr', {}, h('td', {colspan: '4', style: 'text-align:center;color:#aaa;padding:20px;'}, 'İşçi yoxdur')));
        return;
    }
    const icons = {kassir: '💰 Kassir', ofisiant: '🍽️ Ofisiant', paketci: '📦 Paketçi'};
    isciler.sort((a, b) => a.id - b.id).forEach(i => tb.appendChild(h('tr', {},
        h('td', {}, h('b', {}, i.kod)), h('td', {}, i.ad), h('td', {}, icons[i.rol] || i.rol),
        h('td', {},
            h('button', {className: 'small-btn edit-b', onclick: () => ad_isciDuzelis(i.id)}, '✏️'),
            h('button', {className: 'small-btn del-b', onclick: () => ad_isciSil(i.id)}, '🗑️'))
    )));
}

const kassirSayi = (isciler, haric) => isciler.filter(i => i.rol === 'kassir' && i.id !== haric).length;

async function ad_isciElaveEt() {
    const kod = document.getElementById('yeniKod').value.trim();
    const ad = document.getElementById('yeniAd').value.trim();
    const rol = document.getElementById('yeniRol').value;
    if (!kodDuzgundur(kod)) { toast('❌ Kod yalnız rəqəm olmalıdır!', 'error'); return; }
    if (!ad || !adDuzgundur(ad)) { toast('❌ Ad yalnız hərf olmalıdır!', 'error'); return; }
    if (DATA.isciler.find(i => i.kod === kod)) { toast('❌ Bu kod mövcuddur!', 'error'); return; }
    if (rol === 'kassir' && kassirSayi(DATA.isciler) >= 2) {
        toast('❌ Maksimum 2 kassir ola bilər!', 'error'); return;
    }
    try {
        const id = await yeniId('isci');
        await FB.set(DR('isciler/' + id), {id, kod, ad, rol});
        document.getElementById('yeniKod').value = '';
        document.getElementById('yeniAd').value = '';
        toast('✅ İşçi əlavə edildi!', 'success');
    } catch (err) {
        toast('❌ Xəta: ' + err.message, 'error', 5000);
    }
    setTimeout(ad_iscileriYukle, 300);
}

async function ad_isciSil(id) {
    const isci = DATA.isciler.find(i => i.id === id);
    if (!isci || isci.rol === 'admin') return;
    confirmDialog(`"${esc(isci.ad)}" adlı işçini silmək istəyirsiniz? Bu əməliyyat geri qaytarıla bilməz.`, async cavab => {
        if (!cavab) return;
        try {
            const aktivS = DATA.sessiyalar.filter(s => s.isci_id === id && s.status === 'aktiv');
            for (const s of aktivS) await sessiyaBagla(s.id);
            await FB.remove(DR('isciler/' + id));
            toast(`✅ "${isci.ad}" silindi!`, 'success');
        } catch (err) {
            toast('❌ Xəta: ' + err.message, 'error', 5000);
        }
        setTimeout(ad_iscileriYukle, 300);
    }, 'İşçini sil', '🗑️');
}

async function ad_isciDuzelis(id) {
    const i = DATA.isciler.find(x => x.id === id);
    if (!i) return;
    const kod = (prompt('Kod:', i.kod) || '').trim(); if (!kod) return;
    const ad = (prompt('Ad:', i.ad) || '').trim(); if (!ad) return;
    const rol = (prompt('Rol (ofisiant/kassir/paketci):', i.rol) || '').trim().toLowerCase(); if (!rol) return;

    if (!kodDuzgundur(kod)) { toast('❌ Kod yalnız rəqəm olmalıdır!', 'error'); return; }
    if (!adDuzgundur(ad)) { toast('❌ Ad yalnız hərf olmalıdır!', 'error'); return; }
    if (!['ofisiant', 'kassir', 'paketci'].includes(rol)) { toast('❌ Rol yanlışdır!', 'error'); return; }
    if (DATA.isciler.find(x => x.kod === kod && x.id !== id)) { toast('❌ Bu kod mövcuddur!', 'error'); return; }
    if (rol === 'kassir' && i.rol !== 'kassir' && kassirSayi(DATA.isciler, id) >= 2) {
        toast('❌ Maksimum 2 kassir ola bilər!', 'error'); return;
    }
    await FB.update(DR('isciler/' + id), {kod, ad, rol});
    toast('✅ İşçi yeniləndi!', 'success');
    setTimeout(ad_iscileriYukle, 300);
}

// AKTİV MASALAR
function ad_renderAktiv() {
    const c = document.getElementById('ad-p-aktiv');
    c.innerHTML = '';
    c.appendChild(h('h3', {className: 's-title'}, '📋 Aktiv Masalar'));
    c.appendChild(h('div', {className: 'form'}, h('button', {style: 'background:#27ae60;', onclick: () => window.print()}, '🖨️ Çap et')));
    c.appendChild(h('div', {id: 'ad-aktivMasalarList'}));
    ad_aktivMasalariYukle();
}

function ad_aktivMasalariYukle() {
    const sess = DATA.sessiyalar.filter(s => s.status === 'aktiv');
    const el = document.getElementById('ad-aktivMasalarList');
    if (!el) return;
    el.innerHTML = '';
    if (!sess.length) {
        el.appendChild(h('p', {style: 'text-align:center;color:#aaa;padding:40px;'}, '✅ Aktiv masa yoxdur'));
        return;
    }
    sess.sort((a, b) => b.id - a.id).forEach(s => {
        const sif = DATA.sifarisler.filter(x => x.sessiya_id === s.id);
        const tbl = h('table', {style: 'margin-top:15px;'},
            h('thead', {}, h('tr', {}, ...['Məhsul', 'Miqdar', 'Qiymət', 'Məbləğ', 'Saat', 'Sil'].map(t => h('th', {}, t)))),
            h('tbody', {}, ...sif.map(x => h('tr', {},
                h('td', {}, x.mehsul_ad), h('td', {}, x.miqdar), h('td', {}, pul(x.qiymet)),
                h('td', {style: 'color:#e94560;font-weight:bold;'}, pul(x.mebleg)),
                h('td', {style: 'color:#aaa;font-size:12px;'}, new Date(x.tarix).toLocaleTimeString('az-AZ')),
                h('td', {}, h('button', {className: 'small-btn del-b', onclick: () => ad_sifarisSil(x.id)}, '🗑️'))))));
        el.appendChild(h('div', {className: 'aktiv-masa-kart'},
            h('div', {className: 'aktiv-masa-header'},
                h('div', {},
                    h('div', {className: 'aktiv-masa-ad'}, s.tip === 'paket' ? '📦 Paket #' + s.paket_nomre : s.masa_ad),
                    h('div', {className: 'aktiv-masa-info'}, `👤 ${s.isci_ad} · 🍽️ ${sif.length} sifariş`),
                    h('div', {className: 'aktiv-masa-timer'}, h('span', {}, '⏱️'),
                        h('span', {className: 'aktiv-timer', 'data-baslama': s.baslama}, '00:00:00'))),
                h('div', {className: 'aktiv-masa-mebleg'}, pul(s.yekun))),
            sif.length ? tbl : h('p', {style: 'color:#aaa;padding:10px;'}, 'Sifariş yoxdur'),
            h('div', {className: 'aktiv-masa-btnler'},
                h('button', {className: 'small-btn', style: 'background:#e74c3c;', onclick: () => ad_masaBosalt(s.id)}, '🗑️ Boşalt'))
        ));
    });
    timerBaslat();
}

async function ad_sifarisSil(id) {
    const x = DATA.sifarisler.find(o => o.id === id);
    if (!x) return;
    confirmDialog(`"${esc(x.mehsul_ad)} x${x.miqdar}" sifarişini silmək istəyirsiniz?`, async cavab => {
        if (!cavab) return;
        try {
            const s = DATA.sessiyalar.find(y => y.id === x.sessiya_id);
            await FB.remove(DR('sifarisler/' + id));
            if (s) {
                const nisbet = s.mebleg ? (s.endirim_mebleg || 0) / s.mebleg : 0;
                const yeniMebleg = Math.max(0, (s.mebleg || 0) - x.mebleg);
                const yeniEndirim = yeniMebleg * nisbet;
                await FB.update(DR('sessiyalar/' + s.id), {
                    mebleg: yeniMebleg,
                    endirim_mebleg: yeniEndirim,
                    yekun: yeniMebleg - yeniEndirim,
                    endirim_faiz: yeniMebleg ? Math.round(nisbet * 1000) / 10 : 0
                });
            }
            toast('✅ Sifariş silindi', 'success');
        } catch (err) {
            toast('❌ Xəta: ' + err.message, 'error', 5000);
        }
        setTimeout(ad_aktivMasalariYukle, 300);
    }, 'Sifarişi sil', '🗑️');
}

async function ad_masaBosalt(id) {
    confirmDialog('Masayı bağlamaq/boşaltmaq istəyirsiniz?', async cavab => {
        if (!cavab) return;
        try {
            await sessiyaBagla(id);
            toast('✅ Masa boşaldıldı', 'success');
        } catch (err) {
            toast('❌ Xəta: ' + err.message, 'error', 5000);
        }
        setTimeout(ad_aktivMasalariYukle, 300);
    }, 'Masanı boşalt', '🗑️');
}

// ALIŞLAR
function ad_renderAlislar() {
    const c = document.getElementById('ad-p-alislar');
    c.innerHTML = '';
    c.appendChild(h('h3', {className: 's-title'}, '🛒 Bütün Alışlar'));
    c.appendChild(h('div', {className: 'form'},
        h('input', {type: 'date', id: 'ad-alisTarix', value: bugun()}),
        h('button', {onclick: ad_alislariYukle}, '🔍 Göstər'),
        h('button', {style: 'background:#27ae60;', onclick: () => window.print()}, '🖨️ Çap et')));
    c.appendChild(h('div', {className: 'stats'},
        h('div', {className: 'stat'}, h('div', {className: 'v', id: 'ad-alisCemi'}, '0.00 ₼'), h('div', {className: 'l'}, 'Günlük Cəmi')),
        h('div', {className: 'stat'}, h('div', {className: 'v', id: 'ad-alisSayi'}, '0'), h('div', {className: 'l'}, 'Alış Sayı'))));
    c.appendChild(h('table', {},
        h('thead', {}, h('tr', {}, ...['Mal', 'Qiymət', 'Miqdar', 'Cəmi', 'Qeyd', 'İşçi', 'Tarix', 'Sil'].map(t => h('th', {}, t)))),
        h('tbody', {id: 'ad-alisTable'})));
    ad_alislariYukle();
}

function ad_alislariYukle() {
    const el = document.getElementById('ad-alisTarix');
    if (!el) return;
    const t = el.value;
    const alislar = DATA.alislar.filter(a => gun(a.tarix) === t);
    document.getElementById('ad-alisCemi').textContent = pul(cem(alislar, x => x.cemi));
    document.getElementById('ad-alisSayi').textContent = alislar.length;
    const tb = document.getElementById('ad-alisTable');
    tb.innerHTML = '';
    if (!alislar.length) {
        tb.appendChild(h('tr', {}, h('td', {colspan: '8', style: 'text-align:center;color:#aaa;padding:20px;'}, 'Alış yoxdur')));
        return;
    }
    alislar.sort((a, b) => b.id - a.id).forEach(a => tb.appendChild(h('tr', {},
        h('td', {}, a.mal_ad), h('td', {}, pul(a.qiymet)), h('td', {}, a.miqdar),
        h('td', {style: 'color:#2ecc71;font-weight:bold;'}, pul(a.cemi)), h('td', {}, a.qeyd || '-'),
        h('td', {}, a.isci_ad), h('td', {}, tarixFormat(a.tarix)),
        h('td', {}, h('button', {className: 'small-btn del-b', onclick: () => ad_alisSil(a.id)}, '🗑️')))));
}

async function ad_alisSil(id) {
    confirmDialog('Alışı silmək istəyirsiniz?', async cavab => {
        if (!cavab) return;
        try {
            await FB.remove(DR('alislar/' + id));
            toast('✅ Silindi', 'success');
        } catch (err) {
            toast('❌ Xəta: ' + err.message, 'error', 5000);
        }
        setTimeout(ad_alislariYukle, 300);
    }, 'Alışı sil', '🗑️');
}

// ENDİRİMLƏR
function ad_renderEndirimler() {
    const c = document.getElementById('ad-p-endirimler');
    c.innerHTML = '';
    c.appendChild(h('h3', {className: 's-title'}, '💰 Endirimlər'));
    c.appendChild(h('div', {className: 'form'},
        h('input', {type: 'date', id: 'ad-endirimTarix', value: bugun()}),
        h('button', {onclick: ad_endirimleriYukle}, '🔍 Göstər'),
        h('button', {style: 'background:#27ae60;', onclick: () => window.print()}, '🖨️ Çap et')));
    c.appendChild(h('div', {className: 'stats'},
        h('div', {className: 'stat'}, h('div', {className: 'v', id: 'ad-endirimSayi'}, '0'), h('div', {className: 'l'}, 'Endirim Sayı')),
        h('div', {className: 'stat'}, h('div', {className: 'v', id: 'ad-endirimCemi'}, '0.00 ₼'), h('div', {className: 'l'}, 'Ümumi Endirim'))));
    c.appendChild(h('table', {},
        h('thead', {}, h('tr', {}, ...['Masa/Paket', 'Müştəri', 'Faiz', 'Əvvəlki', 'Endirim', 'Yekun', 'İşçi', 'Tarix'].map(t => h('th', {}, t)))),
        h('tbody', {id: 'ad-endirimTable'})));
    ad_endirimleriYukle();
}

function ad_endirimleriYukle() {
    const el = document.getElementById('ad-endirimTarix');
    if (!el) return;
    const t = el.value;
    const end = DATA.endirimler.filter(e => gun(e.tarix) === t);
    document.getElementById('ad-endirimSayi').textContent = end.length;
    document.getElementById('ad-endirimCemi').textContent = pul(cem(end, e => e.endirim));
    const tb = document.getElementById('ad-endirimTable');
    tb.innerHTML = '';
    if (!end.length) {
        tb.appendChild(h('tr', {}, h('td', {colspan: '8', style: 'text-align:center;color:#aaa;padding:20px;'}, 'Endirim yoxdur')));
        return;
    }
    end.slice().sort((a, b) => b.id - a.id).forEach(e => tb.appendChild(h('tr', {},
        h('td', {}, e.masa_ad), h('td', {style: 'color:#f39c12;font-weight:bold;'}, e.musteri_ad),
        h('td', {style: 'color:#e94560;font-weight:bold;'}, e.faiz + '%'), h('td', {}, pul(e.evvelki)),
        h('td', {style: 'color:#e94560;'}, '-' + pul(e.endirim)),
        h('td', {style: 'color:#2ecc71;font-weight:bold;'}, pul(e.yekun)), h('td', {}, e.isci_ad), h('td', {}, tarixFormat(e.tarix)))));
}

// HESABAT
function ad_renderHesabat() {
    const c = document.getElementById('ad-p-hesabat');
    c.innerHTML = '';
    c.appendChild(h('h3', {className: 's-title'}, '📊 Günlük Hesabat'));
    c.appendChild(h('div', {className: 'form'},
        h('input', {type: 'date', id: 'ad-hesabatTarix', value: bugun()}),
        h('button', {onclick: ad_hesabatYukle}, '🔍 Göstər'),
        h('button', {style: 'background:#27ae60;', onclick: () => window.print()}, '🖨️ Çap et')));
    c.appendChild(h('div', {className: 'stats'},
        h('div', {className: 'stat'}, h('div', {className: 'v', id: 'ad-umumiSatis'}, '0.00 ₼'), h('div', {className: 'l'}, 'Ümumi Satış')),
        h('div', {className: 'stat'}, h('div', {className: 'v', id: 'ad-masaSatis'}, '0.00 ₼'), h('div', {className: 'l'}, '🍽️ Masa')),
        h('div', {className: 'stat'}, h('div', {className: 'v', id: 'ad-paketSatis'}, '0.00 ₼'), h('div', {className: 'l'}, '📦 Paket')),
        h('div', {className: 'stat'}, h('div', {className: 'v', id: 'ad-sifarisSayi'}, '0'), h('div', {className: 'l'}, 'Sifariş Sayı')),
        h('div', {className: 'stat'}, h('div', {className: 'v', id: 'ad-endirimliSayi'}, '0'), h('div', {className: 'l'}, 'Endirimli'))));
    c.appendChild(h('h4', {className: 'bolme-basliq'}, '🍽️ Masa Sifarişləri (İşçi üzrə)'));
    c.appendChild(h('table', {},
        h('thead', {}, h('tr', {}, ...['Ad', 'Kod', 'Rol', 'Masa', 'Alış', 'Endirim', 'Ümumi'].map(t => h('th', {}, t)))),
        h('tbody', {id: 'ad-hesabatTable'})));
    c.appendChild(h('h4', {className: 'bolme-basliq paket-basliq'}, '📦 Paket Sifarişləri'));
    c.appendChild(h('div', {id: 'ad-hesabatPaketWrap'}));
    ad_hesabatYukle();
}

function ad_hesabatYukle() {
    const el = document.getElementById('ad-hesabatTarix');
    if (!el) return;
    const t = el.value;
    const isciler = DATA.isciler.filter(i => i.rol !== 'admin');
    const sif = DATA.sifarisler.filter(s => gun(s.tarix) === t);
    const sess = DATA.sessiyalar.filter(s => gun(s.baslama) === t);
    const alislar = DATA.alislar.filter(a => gun(a.tarix) === t);
    const end = DATA.endirimler.filter(e => gun(e.tarix) === t);

    let umumi = 0, masaSatis = 0, paketSatis = 0, endirimli = 0;
    const netice = isciler.map(i => {
        const ms = sif.filter(s => s.isci_id === i.id && s.masa_id !== null);
        const ps = sess.filter(s => s.isci_id === i.id && s.tip === 'paket');
        const as = alislar.filter(a => a.isci_id === i.id);
        const en = end.filter(e => e.isci_id === i.id);
        const mm = cem(ms, s => s.mebleg) - cem(en.filter(e => e.tip === 'masa'), e => e.endirim);
        const pm = cem(ps, p => p.yekun);
        umumi += mm + pm; masaSatis += mm; paketSatis += pm;
        if (en.length) endirimli++;
        return {i, ms, as, en, mm, am: cem(as, a => a.cemi), endM: cem(en, e => e.endirim), umumi: mm + pm};
    }).sort((a, b) => b.umumi - a.umumi);

    document.getElementById('ad-umumiSatis').textContent = pul(umumi);
    document.getElementById('ad-masaSatis').textContent = pul(masaSatis);
    document.getElementById('ad-paketSatis').textContent = pul(paketSatis);
    document.getElementById('ad-sifarisSayi').textContent = sif.length;
    document.getElementById('ad-endirimliSayi').textContent = endirimli;

    const tb = document.getElementById('ad-hesabatTable');
    tb.innerHTML = '';
    if (!netice.length) {
        tb.appendChild(h('tr', {}, h('td', {colspan: '7', style: 'text-align:center;color:#aaa;padding:20px;'}, 'Yoxdur')));
    } else {
        const icons = {kassir: '💰', ofisiant: '🍽️', paketci: '📦'};
        netice.forEach(n => tb.appendChild(h('tr', {},
            h('td', {}, n.i.ad), h('td', {}, n.i.kod), h('td', {}, (icons[n.i.rol] || '') + ' ' + n.i.rol),
            h('td', {}, `${n.ms.length} / ${pul(n.mm)}`),
            h('td', {}, `${n.as.length} / ${pul(n.am)}`),
            h('td', {style: n.en.length ? 'color:#e94560;font-weight:bold;' : ''}, n.en.length ? `${n.en.length} / -${pul(n.endM)}` : '-'),
            h('td', {style: 'color:#2ecc71;font-weight:bold;'}, pul(n.umumi)))));
    }

    const pw = document.getElementById('ad-hesabatPaketWrap');
    pw.innerHTML = '';
    const paketler = DATA.sessiyalar.filter(s => s.tip === 'paket' && gun(s.baslama) === t);
    if (!paketler.length) {
        pw.appendChild(h('p', {style: 'text-align:center;color:#aaa;padding:20px;'}, 'Bu tarixdə paket yoxdur'));
    } else {
        const tbody = h('tbody', {});
        paketler.slice().sort((a, b) => b.id - a.id).forEach(p => tbody.appendChild(h('tr', {},
            h('td', {}, h('b', {style: 'color:#f39c12;'}, '#' + p.paket_nomre)),
            h('td', {}, p.musteri_ad || '-'), h('td', {}, p.musteri_tel || '-'),
            h('td', {}, p.unvan || '-'), h('td', {}, p.isci_ad),
            h('td', {style: 'color:#2ecc71;font-weight:bold;'}, pul(p.yekun)),
            h('td', {style: p.endirim_mebleg > 0 ? 'color:#e94560;' : ''}, p.endirim_mebleg > 0 ? `-${p.endirim_faiz}%` : '-'),
            h('td', {}, p.status === 'aktiv' ? '🟡 Aktiv' : '🟢 Bağlı'),
            h('td', {}, tarixFormat(p.baslama))
        )));
        pw.appendChild(h('table', {},
            h('thead', {}, h('tr', {}, ...['Nömrə', 'Müştəri', 'Telefon', 'Ünvan', 'İşçi', 'Məbləğ', 'Endirim', 'Status', 'Tarix'].map(t => h('th', {}, t)))),
            tbody));
    }
}

// QRAFİKLƏR
function ad_renderQrafikler() {
    const c = document.getElementById('ad-p-qrafikler');
    c.innerHTML = '';
    c.appendChild(h('h3', {className: 's-title'}, '📈 Qrafiklər'));
    c.appendChild(h('div', {className: 'form'}, h('button', {style: 'background:#27ae60;', onclick: () => window.print()}, '🖨️ Çap et')));
    const graf = (title, id) => h('div', {className: 'qrafik-card'}, h('h4', {className: 'q-title'}, title), h('div', {className: 'chart-wrap'}, h('canvas', {id})));
    c.appendChild(graf('💵 Ümumi Satış (Son 7 gün)', 'ad-umumiChart'));
    c.appendChild(h('div', {className: 'qrafik-grid'}, graf('👥 İşçi Satışları', 'ad-isciChart'), graf('🥧 İşçilərin Payı', 'ad-payChart')));
    c.appendChild(graf('🏆 Ən Çox Satılan 10 Məhsul', 'ad-mehsulChart'));
    c.appendChild(graf('🍽️ Kateqoriya üzrə Satış', 'ad-kateqoriyaChart'));
    c.appendChild(graf('📦 Paket Satışları', 'ad-paketChart'));
    c.appendChild(graf('🛒 Günlük Alışlar', 'ad-alisChart'));
}

function cz(key, id, cfg) {
    if (typeof Chart === 'undefined') return;
    if (charts[key]) charts[key].destroy();
    const ctx = document.getElementById(id);
    if (ctx) charts[key] = new Chart(ctx, cfg);
}
const PALET = ['#e94560', '#3498db', '#27ae60', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22', '#34495e', '#c0392b', '#16a085'];
const OXLAR = {y: {beginAtZero: true, ticks: {color: '#aaa'}}, x: {ticks: {color: '#aaa'}}};
const sade = {responsive: true, maintainAspectRatio: false};

function ad_qrafikYukle() {
    const sif = DATA.sifarisler, sess = DATA.sessiyalar, alislar = DATA.alislar;
    const end = DATA.endirimler, isciler = DATA.isciler.filter(i => i.rol !== 'admin');

    const son7 = fn => {
        const r = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(); d.setDate(d.getDate() - i);
            r.push({tarix: d.toLocaleDateString('az-AZ', {weekday: 'short'}) + ' ' + d.getDate(), mebleg: fn(gun(d))});
        }
        return r;
    };
    const xett = (key, id, data, label, renk, fill) => cz(key, id, {
        type: 'line',
        data: {labels: data.map(d => d.tarix), datasets: [{label, data: data.map(d => d.mebleg), borderColor: renk, backgroundColor: fill, borderWidth: 3, fill: true, tension: 0.4}]},
        options: {...sade, plugins: {legend: {labels: {color: '#fff'}}}, scales: OXLAR}
    });
    const sutun = (key, id, data, label, renk) => cz(key, id, {
        type: 'bar',
        data: {labels: data.map(d => d.tarix), datasets: [{label, data: data.map(d => d.mebleg), backgroundColor: renk, borderRadius: 8}]},
        options: {...sade, plugins: {legend: {display: false}}, scales: OXLAR}
    });

    xett('umumi', 'ad-umumiChart',
        son7(t => cem(sif.filter(s => gun(s.tarix) === t), s => s.mebleg) - cem(end.filter(e => gun(e.tarix) === t), e => e.endirim)),
        'Satış (₼)', '#e94560', 'rgba(233,69,96,0.3)');

    const isciData = isciler.map(i => ({ad: i.ad, mebleg: cem(sif.filter(s => s.isci_id === i.id), s => s.mebleg) - cem(end.filter(e => e.isci_id === i.id), e => e.endirim)})).filter(i => i.mebleg > 0);
    cz('isci', 'ad-isciChart', {
        type: 'bar',
        data: {labels: isciData.length ? isciData.map(i => i.ad) : ['Yoxdur'], datasets: [{label: 'Satış (₼)', data: isciData.length ? isciData.map(i => i.mebleg) : [0], backgroundColor: isciData.map((_, i) => PALET[i % 10]), borderRadius: 8}]},
        options: {...sade, plugins: {legend: {display: false}}, scales: {y: OXLAR.y, x: {ticks: {color: '#fff'}}}}
    });
    cz('pay', 'ad-payChart', {
        type: 'doughnut',
        data: {labels: isciData.length ? isciData.map(i => i.ad) : ['Yoxdur'], datasets: [{data: isciData.length ? isciData.map(i => i.mebleg) : [1], backgroundColor: isciData.length ? PALET : ['#333'], borderColor: '#1a1a2e', borderWidth: 3}]},
        options: {...sade, plugins: {legend: {position: 'bottom', labels: {color: '#fff'}}}}
    });

    const qrup = {};
    sif.forEach(s => { qrup[s.mehsul_ad] = (qrup[s.mehsul_ad] || 0) + s.miqdar; });
    const top = Object.entries(qrup).map(([ad, m]) => ({ad, m})).sort((a, b) => b.m - a.m).slice(0, 10);
    cz('mehsul', 'ad-mehsulChart', {
        type: 'bar',
        data: {labels: top.length ? top.map(x => x.ad) : ['Yoxdur'], datasets: [{label: 'Miqdar', data: top.length ? top.map(x => x.m) : [0], backgroundColor: top.map((_, i) => PALET[i % 10]), borderRadius: 8}]},
        options: {...sade, indexAxis: 'y', plugins: {legend: {display: false}}, scales: {x: OXLAR.y, y: {ticks: {color: '#fff'}}}}
    });

    const kat = {};
    sif.forEach(s => { const k = MEHSUL_KAT[s.mehsul_ad] || 'Digər'; kat[k] = (kat[k] || 0) + s.mebleg; });
    const kl = Object.keys(kat);
    cz('kateqoriya', 'ad-kateqoriyaChart', {
        type: 'pie',
        data: {labels: kl.length ? kl : ['Yoxdur'], datasets: [{data: kl.length ? Object.values(kat) : [1], backgroundColor: PALET, borderColor: '#1a1a2e', borderWidth: 3}]},
        options: {...sade, plugins: {legend: {position: 'bottom', labels: {color: '#fff'}}}}
    });

    sutun('paket', 'ad-paketChart', son7(t => cem(sess.filter(s => s.tip === 'paket' && gun(s.baslama) === t), p => p.yekun)), 'Paket (₼)', '#f39c12');
    xett('alis', 'ad-alisChart', son7(t => cem(alislar.filter(a => gun(a.tarix) === t), a => a.cemi)), 'Alış (₼)', '#e74c3c', 'rgba(231,76,60,0.2)');
}

// AYARLAR
function ad_renderAyarlar() {
    const c = document.getElementById('ad-p-ayarlar');
    c.innerHTML = '';
    c.appendChild(h('h3', {className: 's-title'}, '⚙️ Admin Ayarları'));
    c.appendChild(h('div', {className: 'form'},
        h('input', {type: 'text', id: 'ad-adminYeniKod', placeholder: 'Yeni kod', maxlength: '10'}),
        h('input', {type: 'text', id: 'ad-adminYeniAd', placeholder: 'Yeni ad'}),
        h('button', {onclick: ad_adminOzKodDeyis}, '💾 Yadda saxla')));
    c.appendChild(h('p', {id: 'ad-adminAyarMesaj', style: 'margin-top:15px;font-size:14px;'}));
}

async function ad_adminOzKodDeyis() {
    const kod = document.getElementById('ad-adminYeniKod').value.trim();
    const ad = document.getElementById('ad-adminYeniAd').value.trim();
    const m = document.getElementById('ad-adminAyarMesaj');
    const xeta = t => { m.style.color = '#ff6b6b'; m.textContent = t; toast(t, 'error'); };
    if (!kodDuzgundur(kod)) return xeta('❌ Kod yalnız rəqəm!');
    if (!ad || !adDuzgundur(ad)) return xeta('❌ Ad yalnız hərf!');
    const user = istifadeciAl();
    if (DATA.isciler.find(i => i.kod === kod && i.id !== user.id)) return xeta('❌ Bu kod mövcuddur!');
    try {
        await FB.update(DR('isciler/' + user.id), {kod, ad});
        localStorage.setItem('resto_aktiv', JSON.stringify({id: user.id, kod}));
        m.style.color = '#2ecc71'; m.textContent = '✅ Dəyişdirildi!';
        toast('✅ Admin məlumatları yeniləndi!', 'success');
        const adEl = document.querySelector('.header .info .user-name');
        if (adEl) adEl.textContent = '👨‍💼 ' + ad;
    } catch (err) {
        toast('❌ Xəta: ' + err.message, 'error', 5000);
    }
}

// SIFIRLA
function ad_renderSifirla() {
    const c = document.getElementById('ad-p-sifirla');
    c.innerHTML = '';
    c.appendChild(h('h3', {className: 's-title'}, '🗑️ Sıfırlama Mərkəzi'));
    c.appendChild(h('p', {style: 'color:#ff9800;padding:15px;background:rgba(255,152,0,0.1);border-left:4px solid #ff9800;border-radius:8px;margin-bottom:20px;'}, '⚠️ Bu əməliyyatlar geri qaytarıla bilməz!'));
    c.appendChild(h('div', {className: 'stats'},
        h('div', {className: 'stat'}, h('div', {className: 'v', id: 'ad-statIsci'}, '0'), h('div', {className: 'l'}, 'İşçi')),
        h('div', {className: 'stat'}, h('div', {className: 'v', id: 'ad-statSifaris'}, '0'), h('div', {className: 'l'}, 'Sifariş')),
        h('div', {className: 'stat'}, h('div', {className: 'v', id: 'ad-statAlis'}, '0'), h('div', {className: 'l'}, 'Alış'))));
    const grid = h('div', {className: 'sifirla-grid'});
    const mk = (icon, title, desc, key, full) => h('div', {className: 'sifirla-kart' + (full ? ' full' : '')},
        h('div', {className: 'sifirla-icon' + (full ? ' big' : '')}, icon), h('h5', {}, title), h('p', {}, desc),
        h('button', {className: 'sifirla-btn danger' + (full ? ' big' : ''), onclick: () => ad_sifirla(key)}, '🗑️ Sıfırla'));
    grid.appendChild(mk('📋', 'Masaları Sıfırla', 'Bütün masa sifarişləri + sessiyalar', 'masalar'));
    grid.appendChild(mk('📦', 'Paketləri Sıfırla', 'Bütün paketlər', 'paketler'));
    grid.appendChild(mk('🛒', 'Alışları Sıfırla', 'Bütün alış qeydləri', 'alislar'));
    grid.appendChild(mk('👥', 'İşçiləri Sil', 'Admin istisna, bütün işçilər', 'isciler'));
    grid.appendChild(mk('⚠️', 'HƏR ŞEYİ SIFIRLA', 'Bütün məlumatlar silinəcək', 'her-sey', true));
    c.appendChild(grid);
    ad_sifirlaStatistika();
}

function ad_sifirlaStatistika() {
    const set = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
    set('ad-statIsci', DATA.isciler.filter(i => i.rol !== 'admin').length);
    set('ad-statSifaris', DATA.sifarisler.length);
    set('ad-statAlis', DATA.alislar.length);
}

async function ad_sifirla(no) {
    const user = istifadeciAl();
    const mesaj = {
        'masalar': '⚠️ Bütün masa sifarişləri silinəcək!',
        'paketler': '⚠️ Bütün paketlər silinəcək!',
        'alislar': '⚠️ Bütün alışlar silinəcək!',
        'isciler': '⚠️ Bütün işçilər silinəcək!',
        'her-sey': '🚨 HƏR ŞEY SİLİNƏCƏK!'
    }[no];

    confirmDialog(mesaj + ' Davam etmək üçün admin kodunuzu daxil edin.', async cavab => {
        if (!cavab) return;
        const kodDaxil = prompt('🔑 Admin kodu:');
        if (kodDaxil !== user.kod) { toast('❌ Kod yanlışdır!', 'error'); return; }

        try {
            const masalariBosalt = async () => {
                for (const m of DATA.masalar) await FB.update(DR('masalar/' + m.id), {status: 'bos'});
            };
            const sayacSifirla = async ad => { await FB.set(DR('sayac/' + ad), 1); };

            if (no === 'masalar') {
                const masaSessiyaIdleri = DATA.sessiyalar.filter(s => s.tip === 'masa').map(s => s.id);
                for (const x of DATA.sifarisler.filter(x => masaSessiyaIdleri.includes(x.sessiya_id))) await FB.remove(DR('sifarisler/' + x.id));
                for (const s of DATA.sessiyalar.filter(s => s.tip === 'masa')) await FB.remove(DR('sessiyalar/' + s.id));
                await masalariBosalt();
            }
            if (no === 'paketler') {
                const paketSessiyaIdleri = DATA.sessiyalar.filter(s => s.tip === 'paket').map(s => s.id);
                for (const x of DATA.sifarisler.filter(x => paketSessiyaIdleri.includes(x.sessiya_id))) await FB.remove(DR('sifarisler/' + x.id));
                for (const s of DATA.sessiyalar.filter(s => s.tip === 'paket')) await FB.remove(DR('sessiyalar/' + s.id));
                await sayacSifirla('paket');
            }
            if (no === 'alislar') {
                for (const a of DATA.alislar) await FB.remove(DR('alislar/' + a.id));
            }
            if (no === 'isciler') {
                for (const s of DATA.sessiyalar.filter(s => s.status === 'aktiv')) await sessiyaBagla(s.id);
                for (const i of DATA.isciler.filter(x => x.rol !== 'admin')) await FB.remove(DR('isciler/' + i.id));
            }
            if (no === 'her-sey') {
                for (const k of ['sifarisler', 'sessiyalar', 'alislar', 'endirimler']) {
                    for (const x of DATA[k]) await FB.remove(DR(k + '/' + x.id));
                }
                for (const i of DATA.isciler.filter(x => x.rol !== 'admin')) await FB.remove(DR('isciler/' + i.id));
                await masalariBosalt();
                await FB.set(DR('sayac'), {sifaris: 1, sessiya: 1, isci: 2, alis: 1, endirim: 1, paket: 1});
            }
            toast('✅ Sıfırlandı!', 'success');
        } catch (err) {
            toast('❌ Xəta: ' + err.message, 'error', 5000);
        }
        setTimeout(() => ad_render(), 500);
    }, 'Sıfırlama', '⚠️');
}

// ============================================================
// BAŞLAT
// ============================================================
window.addEventListener('load', () => {
    try {
        app = document.getElementById('app');
        if (!app) { app = document.createElement('div'); app.id = 'app'; document.body.appendChild(app); }
        document.body.appendChild(h('div', {className: 'bg-changer', onclick: bgDeyis}, '🎨'));

        fonYukle();

        if (!FB || !FB.db) {
            toast('❌ Firebase yüklənmədi! index.html-i yoxlayın.', 'error', 10000);
            return;
        }

        dinle();

        document.addEventListener('keydown', e => {
            if (!document.querySelector('.login-wrap')) return;
            if (document.getElementById('confirmModal')) return;
            if (/^\d$/.test(e.key)) reqemElave(e.key);
            else if (e.key === 'Backspace') { e.preventDefault(); sonSil(); }
            else if (e.key === 'Escape') koduTemizle();
            else if (e.key === 'Enter') girisEt();
        });
        console.log('✅ Sistem hazırdır');
    } catch (err) {
        console.error('❌ Xəta:', err);
        toast('Xəta: ' + err.message, 'error');
    }
});