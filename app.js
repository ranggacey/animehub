// animehub v2 — app shell mockup
(function () {
  'use strict';

  var GRADS = ['g1','g2','g3','g4','g5','g6'];
  var TITLES = [
    {id:'a1', title:'Judul Anime A',   cat:'anime',   info:'EP 24 • ★ 4.9', syn:'Seorang pemuda biasa menemukan kekuatan tersembunyi dan harus melindungi kotanya dari ancaman yang datang setiap malam.', prog:68, day:'Senin', time:'17:00'},
    {id:'a2', title:'Judul Anime D',   cat:'anime',   info:'EP 8 • ★ 4.7',  syn:'Petualangan sekelompok sahabat menembus dungeon misterius demi mencari artefak legendaris yang hilang.', prog:35, day:'Kamis', time:'19:30'},
    {id:'a3', title:'Judul Anime E',   cat:'anime',   info:'EP 12 • ★ 4.8', syn:'Drama sekolah yang hangat tentang persahabatan, mimpi, dan festival budaya terakhir sebelum kelulusan.', day:'Sabtu', time:'16:00'},
    {id:'d1', title:'Judul Donghua B', cat:'donghua', info:'EP 40 • ★ 4.8', syn:'Kultivator muda menapaki jalan panjang menuju keabadian, melewati ujian sekte dan intrik dunia persilatan.', prog:82, day:'Selasa', time:'18:00'},
    {id:'d2', title:'Judul Donghua F', cat:'donghua', info:'EP 16 • ★ 4.6', syn:'Putri kerajaan yang terbuang membangun kembali kekuatannya dengan bantuan seekor rubah berekor sembilan.', day:'Jumat', time:'20:00'},
    {id:'m1', title:'Judul Manga C',   cat:'manga',   info:'CH 112 • ★ 4.9', syn:'Full color. Seorang koki jalanan berkompetisi di turnamen masak bawah tanah demi melunasi utang keluarganya.', prog:54, day:'Rabu', time:'12:00'},
    {id:'m2', title:'Judul Manga G',   cat:'manga',   info:'CH 45 • ★ 4.7',  syn:'Manhwa aksi: hunter peringkat rendah membangkitkan sistem misterius yang mengubah seluruh hidupnya.', day:'Minggu', time:'10:00'},
    {id:'m3', title:'Judul Manga H',   cat:'manga',   info:'CH 78 • ★ 4.5',  syn:'Romansa kantor yang manis antara dua rival divisi yang diam-diam saling membantu dari balik layar.', day:'Rabu', time:'12:00'}
  ];
  var DAYS = ['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu'];
  var CATL = {anime:'ANIME', donghua:'DONGHUA', manga:'MANGA'};

  var WL_KEY = 'ah_watchlist_v2';
  function getWL(){ try { return JSON.parse(localStorage.getItem(WL_KEY)) || []; } catch(e){ return []; } }
  function setWL(a){ localStorage.setItem(WL_KEY, JSON.stringify(a)); renderWLCount(); }
  function inWL(id){ return getWL().indexOf(id) !== -1; }
  function toggleWL(id){
    var w = getWL(), i = w.indexOf(id);
    if (i === -1) w.push(id); else w.splice(i,1);
    setWL(w); renderWL(); syncSaveBtns();
  }
  function renderWLCount(){ document.getElementById('wlCount').textContent = getWL().length; }

  function grad(i){ return GRADS[i % GRADS.length]; }

  function cardHTML(t, i, showSave){
    var saved = inWL(t.id) ? ' on' : '';
    return '<article class="card" data-id="'+t.id+'">' +
      '<div class="art '+grad(i)+'"><span class="badge">'+CATL[t.cat]+'</span>' +
      (showSave ? '<button class="save'+saved+'" data-save="'+t.id+'" aria-label="Simpan">♡</button>' : '') +
      '</div><div class="cbody"><strong>'+t.title+'</strong><small>'+t.info+'</small>' +
      '<span class="go">'+(t.cat==='manga' ? 'Baca →' : 'Tonton →')+'</span></div></article>';
  }

  function bindCards(scope){
    scope.querySelectorAll('.card').forEach(function (c) {
      c.addEventListener('click', function (e) {
        if (e.target.closest('[data-save]')) return;
        openSheet(c.dataset.id);
      });
    });
    scope.querySelectorAll('[data-save]').forEach(function (b) {
      b.addEventListener('click', function (e) {
        e.stopPropagation();
        toggleWL(b.dataset.save);
      });
    });
  }
  function syncSaveBtns(){
    document.querySelectorAll('[data-save]').forEach(function (b) {
      b.classList.toggle('on', inWL(b.dataset.save));
    });
  }

  // ---- beranda ----
  function renderHome(){
    var cont = TITLES.filter(function(t){ return t.prog; });
    document.getElementById('continueRow').innerHTML = cont.map(function (t, i) {
      return '<button class="cw" data-id="'+t.id+'"><div class="cw-art '+grad(i)+'">' +
        '<div class="cw-bar"><i style="width:'+t.prog+'%"></i></div></div>' +
        '<div class="cw-body"><strong>'+t.title+'</strong><small>'+t.info+' • '+t.prog+'%</small></div></button>';
    }).join('');
    document.getElementById('trendGrid').innerHTML =
      TITLES.slice(0,6).map(function(t,i){ return cardHTML(t,i,true); }).join('');
    var today = TITLES.filter(function(t){ return ['Senin','Selasa','Rabu'].indexOf(t.day) !== -1; }).slice(0,3);
    document.getElementById('todayRow').innerHTML = today.map(function (t, i) {
      return '<button class="trow" data-id="'+t.id+'"><span class="tdot '+grad(i)+'"></span>' +
        '<span><strong>'+t.title+'</strong><small>'+t.info+'</small></span>' +
        '<span class="time">'+t.time+'</span></button>';
    }).join('');
    bindCards(document.getElementById('view-beranda'));
    document.querySelectorAll('#view-beranda [data-id]').forEach(function (el) {
      if (!el.classList.contains('card')) el.addEventListener('click', function(){ openSheet(el.dataset.id); });
    });
  }

  // ---- jelajah ----
  var curCat = 'semua';
  function renderJelajah(){
    var q = document.getElementById('q').value.trim().toLowerCase();
    var list = TITLES.filter(function (t) {
      var okCat = curCat === 'semua' || t.cat === curCat;
      var okQ = !q || t.title.toLowerCase().indexOf(q) !== -1;
      return okCat && okQ;
    });
    var hint = document.getElementById('jelajahHint');
    if (q || curCat !== 'semua') {
      hint.hidden = false;
      hint.textContent = list.length ? list.length + ' judul ditemukan' : 'Tidak ada judul yang cocok';
    } else hint.hidden = true;
    var g = document.getElementById('allGrid');
    g.innerHTML = list.map(function(t){ return cardHTML(t, TITLES.indexOf(t), true); }).join('');
    bindCards(g);
  }

  // ---- jadwal ----
  var curDay = 'Senin';
  function renderDays(){
    document.getElementById('dayChips').innerHTML = DAYS.map(function (d) {
      return '<button class="chip'+(d===curDay?' on':'')+'" data-day="'+d+'">'+d+'</button>';
    }).join('');
    document.querySelectorAll('#dayChips .chip').forEach(function (c) {
      c.addEventListener('click', function(){ curDay = c.dataset.day; renderDays(); renderSched(); });
    });
  }
  function renderSched(){
    var list = TITLES.filter(function(t){ return t.day === curDay; });
    document.getElementById('schedList').innerHTML = list.length ? list.map(function (t, i) {
      return '<div class="srow"><span class="tdot '+grad(i)+'"></span>' +
        '<span><strong>'+t.title+'</strong><small>'+t.info+'</small></span>' +
        '<span class="tag">'+t.time+'</span></div>';
    }).join('') : '<p class="hint">Belum ada rilis terjadwal hari '+curDay+'.</p>';
  }

  // ---- koleksi ----
  function renderWL(){
    var w = getWL();
    var hint = document.getElementById('wlHint');
    hint.textContent = w.length ? w.length + ' judul tersimpan' : 'Judul yang kamu simpan muncul di sini.';
    var g = document.getElementById('wlGrid');
    g.innerHTML = w.map(function (id) {
      var t = TITLES.filter(function(x){ return x.id === id; })[0];
      return t ? cardHTML(t, TITLES.indexOf(t), true) : '';
    }).join('');
    bindCards(g);
  }

  // ---- navigation ----
  function go(view){
    document.querySelectorAll('.view').forEach(function(v){ v.classList.remove('active'); });
    document.getElementById('view-'+view).classList.add('active');
    document.querySelectorAll('[data-view]').forEach(function(b){
      b.classList.toggle('active', b.dataset.view === view);
    });
    if (view === 'jelajah') renderJelajah();
    if (view === 'koleksi') renderWL();
    if (view === 'jadwal') { renderDays(); renderSched(); }
    document.querySelector('.main').scrollTo(0,0); window.scrollTo(0,0);
  }
  document.querySelectorAll('[data-view]').forEach(function (b) {
    b.addEventListener('click', function(){ go(b.dataset.view); });
  });

  // search
  document.getElementById('q').addEventListener('input', function(){
    if (document.getElementById('view-jelajah').classList.contains('active')) renderJelajah();
    else { go('jelajah'); }
  });
  document.querySelectorAll('#catChips .chip').forEach(function (c) {
    c.addEventListener('click', function(){
      curCat = c.dataset.cat;
      document.querySelectorAll('#catChips .chip').forEach(function(x){ x.classList.toggle('on', x===c); });
      renderJelajah();
    });
  });

  // ---- detail sheet ----
  var overlay = document.getElementById('overlay');
  var sheetId = null;
  function openSheet(id){
    var t = TITLES.filter(function(x){ return x.id === id; })[0];
    if (!t) return;
    sheetId = id;
    var art = document.getElementById('sheetArt');
    art.className = 'sheet-art ' + grad(TITLES.indexOf(t));
    document.getElementById('sheetCat').textContent = CATL[t.cat];
    document.getElementById('sheetTitle').textContent = t.title;
    document.getElementById('sheetMeta').textContent = t.info;
    document.getElementById('sheetSyn').textContent = t.syn;
    var isM = t.cat === 'manga';
    document.getElementById('epLabel').textContent = isM ? 'Chapter' : 'Episode';
    document.getElementById('sheetWatch').textContent = isM ? '▶ Mulai baca' : '▶ Mulai nonton';
    var n = parseInt((t.info.match(/\d+/)||[12])[0], 10);
    var eps = '';
    for (var e = 1; e <= Math.min(n, 24); e++) eps += '<button>'+(isM ? 'CH ' : 'EP ') + e + '</button>';
    document.getElementById('epList').innerHTML = eps;
    syncSheetSave();
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function syncSheetSave(){
    document.getElementById('sheetSave').textContent = inWL(sheetId) ? '♥ Tersimpan' : '♡ Simpan';
  }
  document.getElementById('sheetSave').addEventListener('click', function(){
    if (sheetId) { toggleWL(sheetId); syncSheetSave(); }
  });
  function closeSheet(){ overlay.hidden = true; document.body.style.overflow = ''; }
  document.getElementById('closeSheet').addEventListener('click', closeSheet);
  overlay.addEventListener('click', function(e){ if (e.target === overlay) closeSheet(); });
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape') closeSheet(); });

  // init
  renderHome(); renderJelajah(); renderWL(); renderWLCount();
})();
