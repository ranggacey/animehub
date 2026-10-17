// animehub v3 — time-first mockup
(function () {
  'use strict';

  var GRADS = ['g1','g2','g3','g4','g5','g6'];
  var TITLES = [
    {id:'a1', title:'Judul Anime A',   cat:'anime',   info:'EP 24 • ★ 4.9', syn:'Seorang pemuda biasa menemukan kekuatan tersembunyi dan harus melindungi kotanya dari ancaman yang datang setiap malam.', prog:68, day:0, time:'17:00'},
    {id:'a2', title:'Judul Anime D',   cat:'anime',   info:'EP 8 • ★ 4.7',  syn:'Petualangan sekelompok sahabat menembus dungeon misterius demi mencari artefak legendaris yang hilang.', prog:35, day:3, time:'19:30'},
    {id:'a3', title:'Judul Anime E',   cat:'anime',   info:'EP 12 • ★ 4.8', syn:'Drama sekolah yang hangat tentang persahabatan, mimpi, dan festival budaya terakhir sebelum kelulusan.', day:5, time:'16:00'},
    {id:'d1', title:'Judul Donghua B', cat:'donghua', info:'EP 40 • ★ 4.8', syn:'Kultivator muda menapaki jalan panjang menuju keabadian, melewati ujian sekte dan intrik dunia persilatan.', prog:82, day:1, time:'18:00'},
    {id:'d2', title:'Judul Donghua F', cat:'donghua', info:'EP 16 • ★ 4.6', syn:'Putri kerajaan yang terbuang membangun kembali kekuatannya dengan bantuan seekor rubah berekor sembilan.', day:4, time:'20:00'},
    {id:'m1', title:'Judul Manga C',   cat:'manga',   info:'CH 112 • ★ 4.9', syn:'Full color. Seorang koki jalanan berkompetisi di turnamen masak bawah tanah demi melunasi utang keluarganya.', prog:54, day:2, time:'12:00'},
    {id:'m2', title:'Judul Manga G',   cat:'manga',   info:'CH 45 • ★ 4.7',  syn:'Manhwa aksi: hunter peringkat rendah membangkitkan sistem misterius yang mengubah seluruh hidupnya.', day:6, time:'10:00'},
    {id:'m3', title:'Judul Manga H',   cat:'manga',   info:'CH 78 • ★ 4.5',  syn:'Romansa kantor yang manis antara dua rival divisi yang diam-diam saling membantu dari balik layar.', day:2, time:'12:00'}
  ];
  var DAYS = ['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu'];
  var CATL = {anime:'ANIME', donghua:'DONGHUA', manga:'MANGA'};
  var todayIdx = (new Date().getDay() + 6) % 7; // Senin=0
  var curDay = todayIdx;

  var WL_KEY = 'ah_watchlist_v3';
  function getWL(){ try { return JSON.parse(localStorage.getItem(WL_KEY)) || []; } catch(e){ return []; } }
  function setWL(a){ localStorage.setItem(WL_KEY, JSON.stringify(a)); renderCount(); }
  function inWL(id){ return getWL().indexOf(id) !== -1; }
  function toggleWL(id){
    var w = getWL(), i = w.indexOf(id);
    if (i === -1) w.push(id); else w.splice(i, 1);
    setWL(w); syncSave(); renderWLGrid();
  }
  function renderCount(){ document.getElementById('wlCount').textContent = getWL().length; }
  function grad(i){ return GRADS[i % GRADS.length]; }

  function cardHTML(t, showSave){
    var i = TITLES.indexOf(t);
    return '<article class="card" data-id="'+t.id+'"><div class="art '+grad(i)+'">' +
      '<span class="badge">'+CATL[t.cat]+'</span>' +
      (showSave ? '<button class="save'+(inWL(t.id)?' on':'')+'" data-save="'+t.id+'">♡</button>' : '') +
      '</div><div class="cbody"><strong>'+t.title+'</strong><small>'+t.info+'</small>' +
      '<span class="go">'+(t.cat==='manga'?'Baca →':'Tonton →')+'</span></div></article>';
  }
  function bindCards(scope){
    scope.querySelectorAll('.card').forEach(function (c) {
      c.addEventListener('click', function (e) {
        if (e.target.closest('[data-save]')) return;
        openSheet(c.dataset.id);
      });
    });
    scope.querySelectorAll('[data-save]').forEach(function (b) {
      b.addEventListener('click', function (e) { e.stopPropagation(); toggleWL(b.dataset.save); });
    });
  }
  function syncSave(){
    document.querySelectorAll('[data-save]').forEach(function (b) {
      b.classList.toggle('on', inWL(b.dataset.save));
    });
    if (sheetId) document.getElementById('sheetSave').textContent = inWL(sheetId) ? '♥ Tersimpan' : '♡ Simpan';
  }

  // day pills (real dates, Monday-based week)
  function renderDays(){
    var now = new Date();
    var monday = new Date(now);
    monday.setDate(now.getDate() - todayIdx);
    document.getElementById('dayPills').innerHTML = DAYS.map(function (d, i) {
      var dt = new Date(monday); dt.setDate(monday.getDate() + i);
      return '<button class="day'+(i===curDay?' on':'')+'" data-d="'+i+'"><small>'+d.slice(0,3).toUpperCase()+'</small><strong>'+dt.getDate()+'</strong></button>';
    }).join('');
    document.querySelectorAll('#dayPills .day').forEach(function (b) {
      b.addEventListener('click', function(){ curDay = +b.dataset.d; renderDays(); renderAir(); });
    });
    var d = new Date();
    document.getElementById('dateLine').textContent =
      curDay === todayIdx ? 'HARI INI • ' + d.toLocaleDateString('id-ID',{day:'numeric',month:'long'}) : DAYS[curDay].toUpperCase();
    document.getElementById('dayName').textContent = DAYS[curDay];
  }

  function renderAir(){
    var list = TITLES.filter(function(t){ return t.day === curDay; });
    document.getElementById('airDay').textContent = curDay === todayIdx ? 'hari ini' : 'hari '+DAYS[curDay].toLowerCase();
    var sub = document.getElementById('daySub');
    sub.textContent = list.length ? list.length + ' judul tayang' : 'Tidak ada rilis terjadwal';
    var row = document.getElementById('airRow');
    row.innerHTML = list.length ? list.map(function (t) {
      var i = TITLES.indexOf(t);
      return '<button class="acard '+grad(i)+'" data-id="'+t.id+'"><span class="atime">'+t.time+'</span>' +
        '<span><strong>'+t.title+'</strong><small>'+t.info+'</small></span></button>';
    }).join('') : '<p class="aempty">Kosong — coba hari lain.</p>';
    row.querySelectorAll('[data-id]').forEach(function (el) {
      el.addEventListener('click', function(){ openSheet(el.dataset.id); });
    });
  }

  function renderCont(){
    var row = document.getElementById('contRow');
    row.innerHTML = TITLES.filter(function(t){ return t.prog; }).map(function (t) {
      var i = TITLES.indexOf(t);
      return '<button class="cw" data-id="'+t.id+'"><div class="cw-art '+grad(i)+'">' +
        '<div class="cw-bar"><i style="width:'+t.prog+'%"></i></div></div>' +
        '<div class="cw-body"><strong>'+t.title+'</strong><small>'+t.info+' • '+t.prog+'%</small></div></button>';
    }).join('');
    row.querySelectorAll('[data-id]').forEach(function (el) {
      el.addEventListener('click', function(){ openSheet(el.dataset.id); });
    });
  }

  var curCat = 'semua';
  function renderGrid(){
    var q = document.getElementById('q').value.trim().toLowerCase();
    var list = TITLES.filter(function (t) {
      return (curCat === 'semua' || t.cat === curCat) && (!q || t.title.toLowerCase().indexOf(q) !== -1);
    });
    var hint = document.getElementById('hint');
    if (q || curCat !== 'semua') {
      hint.hidden = false;
      hint.textContent = list.length ? list.length + ' judul ditemukan' : 'Tidak ada judul yang cocok';
    } else hint.hidden = true;
    var g = document.getElementById('grid');
    g.innerHTML = list.map(function(t){ return cardHTML(t, true); }).join('');
    bindCards(g);
  }

  function renderWLGrid(){
    var w = getWL();
    var sec = document.getElementById('wlSection');
    var g = document.getElementById('wlGrid');
    g.innerHTML = w.map(function (id) {
      var t = TITLES.filter(function(x){ return x.id === id; })[0];
      return t ? cardHTML(t, true) : '';
    }).join('');
    bindCards(g);
  }

  document.getElementById('koleksiBtn').addEventListener('click', function(){
    var sec = document.getElementById('wlSection');
    sec.hidden = !sec.hidden;
    if (!sec.hidden) { renderWLGrid(); sec.scrollIntoView({behavior:'smooth'}); }
  });
  document.getElementById('q').addEventListener('input', renderGrid);
  document.querySelectorAll('#catChips .chip').forEach(function (c) {
    c.addEventListener('click', function(){
      curCat = c.dataset.cat;
      document.querySelectorAll('#catChips .chip').forEach(function(x){ x.classList.toggle('on', x===c); });
      renderGrid();
    });
  });

  // detail sheet
  var overlay = document.getElementById('overlay'), sheetId = null;
  function openSheet(id){
    var t = TITLES.filter(function(x){ return x.id === id; })[0];
    if (!t) return;
    sheetId = id;
    document.getElementById('sheetArt').className = 'sheet-art ' + grad(TITLES.indexOf(t));
    document.getElementById('sheetCat').textContent = CATL[t.cat];
    document.getElementById('sheetTitle').textContent = t.title;
    document.getElementById('sheetMeta').textContent = t.info + ' • ' + DAYS[t.day] + ' ' + t.time;
    document.getElementById('sheetSyn').textContent = t.syn;
    var isM = t.cat === 'manga';
    document.getElementById('epLabel').textContent = isM ? 'Chapter' : 'Episode';
    document.getElementById('sheetWatch').textContent = isM ? '▶ Mulai baca' : '▶ Mulai nonton';
    var n = parseInt((t.info.match(/\d+/)||[12])[0], 10), eps = '';
    for (var e = 1; e <= Math.min(n, 24); e++) eps += '<button>'+(isM?'CH ':'EP ')+e+'</button>';
    document.getElementById('epList').innerHTML = eps;
    syncSave();
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
  }
  document.getElementById('sheetSave').addEventListener('click', function(){ if (sheetId) toggleWL(sheetId); });
  function close(){ overlay.hidden = true; document.body.style.overflow = ''; }
  document.getElementById('closeSheet').addEventListener('click', close);
  overlay.addEventListener('click', function(e){ if (e.target === overlay) close(); });
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape') close(); });

  renderDays(); renderAir(); renderCont(); renderGrid(); renderCount();
})();
