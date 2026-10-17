// animehub v5 — feed-first mockup
(function () {
  'use strict';

  var TITLES = [
    {id:'a1', title:'Judul Anime A',   jp:'物語', cat:'anime',   info:'EP 24 • ★ 4.9 • Aksi',    syn:'Seorang pemuda biasa menemukan kekuatan tersembunyi dan harus melindungi kotanya dari ancaman yang datang setiap malam.', g:'g1'},
    {id:'d1', title:'Judul Donghua B', jp:'仙侠', cat:'donghua', info:'EP 40 • ★ 4.8 • Fantasi', syn:'Kultivator muda menapaki jalan panjang menuju keabadian, melewati ujian sekte dan intrik dunia persilatan.', g:'g2'},
    {id:'m1', title:'Judul Manga C',   jp:'料理', cat:'manga',   info:'CH 112 • ★ 4.9 • Full color', syn:'Seorang koki jalanan berkompetisi di turnamen masak bawah tanah demi melunasi utang keluarganya.', g:'g3'},
    {id:'a2', title:'Judul Anime D',   jp:'冒険', cat:'anime',   info:'EP 8 • ★ 4.7 • Petualangan', syn:'Petualangan sekelompok sahabat menembus dungeon misterius demi mencari artefak legendaris yang hilang.', g:'g4'},
    {id:'d2', title:'Judul Donghua F', jp:'狐',  cat:'donghua', info:'EP 16 • ★ 4.6 • Kerajaan', syn:'Putri kerajaan yang terbuang membangun kembali kekuatannya dengan bantuan seekor rubah berekor sembilan.', g:'g5'},
    {id:'a3', title:'Judul Anime E',   jp:'学園', cat:'anime',   info:'EP 12 • ★ 4.8 • Drama',   syn:'Drama sekolah yang hangat tentang persahabatan, mimpi, dan festival budaya terakhir sebelum kelulusan.', g:'g6'},
    {id:'m2', title:'Judul Manga G',   jp:'狩',  cat:'manga',   info:'CH 45 • ★ 4.7 • Aksi',    syn:'Hunter peringkat rendah membangkitkan sistem misterius yang mengubah seluruh hidupnya.', g:'g7'},
    {id:'m3', title:'Judul Manga H',   jp:'恋',  cat:'manga',   info:'CH 78 • ★ 4.5 • Romansa', syn:'Romansa kantor yang manis antara dua rival divisi yang diam-diam saling membantu dari balik layar.', g:'g8'}
  ];
  var CATL = {anime:'ANIME', donghua:'DONGHUA', manga:'MANGA'};

  var WL_KEY = 'ah_watchlist_v5';
  function getWL(){ try { return JSON.parse(localStorage.getItem(WL_KEY)) || []; } catch(e){ return []; } }
  function setWL(a){ localStorage.setItem(WL_KEY, JSON.stringify(a)); syncAll(); }
  function inWL(id){ return getWL().indexOf(id) !== -1; }
  function toggleWL(id){
    var w = getWL(), i = w.indexOf(id);
    if (i === -1) w.push(id); else w.splice(i, 1);
    setWL(w);
  }
  function byId(id){ return TITLES.filter(function(t){ return t.id === id; })[0]; }

  var feed = document.getElementById('feed');
  var dotsBox = document.getElementById('dots');

  // build cards
  feed.innerHTML = TITLES.map(function (t) {
    var isM = t.cat === 'manga';
    return '<section class="fcard" data-id="'+t.id+'">' +
      '<div class="fgrad '+t.g+'"></div><div class="fshade"></div>' +
      '<div class="jp">'+t.jp+'</div>' +
      '<div class="finfo"><p class="kicker">'+CATL[t.cat]+' • ★ '+t.info.split('★ ')[1].split(' ')[0]+'</p>' +
      '<h1>'+t.title+'</h1><p class="meta">'+t.info+'</p><p class="syn">'+t.syn+'</p>' +
      '<div class="fact"><button class="btn-play" data-watch="'+t.id+'">'+(isM?'▶ Baca':'▶ Tonton')+'</button>' +
      '<button class="btn-line" data-detail="'+t.id+'">Detail</button></div></div>' +
      '<div class="rail"><button class="rbtn" data-save="'+t.id+'" aria-label="Simpan">♡</button>' +
      '<button class="rbtn" data-detail="'+t.id+'" aria-label="Detail">ⓘ</button></div>' +
      '</section>';
  }).join('');

  dotsBox.innerHTML = TITLES.map(function (_, i) {
    return '<i data-go="'+i+'" class="'+(i===0?'on':'')+'"></i>';
  }).join('');

  function syncAll(){
    var w = getWL();
    document.getElementById('wlCount').textContent = w.length;
    document.querySelectorAll('[data-save]').forEach(function (b) {
      b.classList.toggle('on', w.indexOf(b.dataset.save) !== -1);
    });
    if (sheetId) document.getElementById('sheetSave').textContent = inWL(sheetId) ? '♥ Tersimpan' : '♡ Simpan';
  }

  // nav dots
  var cards = Array.prototype.slice.call(feed.querySelectorAll('.fcard'));
  dotsBox.querySelectorAll('i').forEach(function (d) {
    d.addEventListener('click', function(){
      cards[+d.dataset.go].scrollIntoView({behavior:'smooth'});
    });
  });
  var hint = document.getElementById('swipeHint'), hintGone = false;
  feed.addEventListener('scroll', function(){
    var idx = Math.round(feed.scrollTop / window.innerHeight);
    dotsBox.querySelectorAll('i').forEach(function (d, k) {
      d.classList.toggle('on', k === idx);
    });
    if (!hintGone && feed.scrollTop > 60) { hint.classList.add('gone'); hintGone = true; }
  }, {passive:true});

  // keyboard
  document.addEventListener('keydown', function(e){
    if (!document.getElementById('soverlay').hidden || !document.getElementById('overlay').hidden) {
      if (e.key === 'Escape') { closeS(); closeSheet(); closeWl(); }
      return;
    }
    var idx = Math.round(feed.scrollTop / window.innerHeight);
    if (e.key === 'ArrowDown' || e.key === ' ') {
      e.preventDefault();
      if (idx < cards.length - 1) cards[idx+1].scrollIntoView({behavior:'smooth'});
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (idx > 0) cards[idx-1].scrollIntoView({behavior:'smooth'});
    } else if (e.key === 'Escape') { closeS(); closeSheet(); closeWl(); }
  });

  // actions
  feed.addEventListener('click', function(e){
    var w = e.target.closest('[data-watch]');
    var d = e.target.closest('[data-detail]');
    var s = e.target.closest('[data-save]');
    if (s) { toggleWL(s.dataset.save); return; }
    if (w) { openSheet(w.dataset.watch); return; }
    if (d) { openSheet(d.dataset.detail); return; }
  });

  // search
  var so = document.getElementById('soverlay'), sq = document.getElementById('sq');
  document.getElementById('searchBtn').addEventListener('click', function(){
    so.hidden = false; sq.value = ''; renderS(''); setTimeout(function(){ sq.focus(); }, 50);
  });
  function closeS(){ so.hidden = true; }
  so.addEventListener('click', function(e){ if (e.target === so) closeS(); });
  sq.addEventListener('input', function(){ renderS(sq.value.trim().toLowerCase()); });
  function rowHTML(t){
    return '<button class="sr" data-id="'+t.id+'"><span class="sd '+t.g+'"></span>' +
      '<span><strong>'+t.title+'</strong><small>'+CATL[t.cat]+' • '+t.info+'</small></span></button>';
  }
  function renderS(q){
    var list = TITLES.filter(function (t) { return !q || t.title.toLowerCase().indexOf(q) !== -1; });
    var box = document.getElementById('sres');
    box.innerHTML = list.map(rowHTML).join('') || '<p style="color:var(--mut)">Tidak ada hasil.</p>';
    box.querySelectorAll('.sr').forEach(function (r) {
      r.addEventListener('click', function(){ closeS(); openSheet(r.dataset.id); });
    });
  }

  // koleksi
  var wlo = document.getElementById('wloverlay');
  document.getElementById('wlBtn').addEventListener('click', function(){
    var w = getWL();
    var box = document.getElementById('wlres');
    box.innerHTML = w.length
      ? w.map(function(id){ var t = byId(id); return t ? rowHTML(t) : ''; }).join('')
      : '<p style="color:var(--mut)">Belum ada simpanan. Tap ♡ di feed.</p>';
    box.querySelectorAll('.sr').forEach(function (r) {
      r.addEventListener('click', function(){ closeWl(); openSheet(r.dataset.id); });
    });
    wlo.hidden = false;
  });
  function closeWl(){ wlo.hidden = true; }
  wlo.addEventListener('click', function(e){ if (e.target === wlo) closeWl(); });

  // detail
  var overlay = document.getElementById('overlay'), sheetId = null;
  function openSheet(id){
    var t = byId(id); if (!t) return;
    sheetId = id;
    document.getElementById('sheetBg').className = 'sheet-bg ' + t.g;
    document.getElementById('sheetCat').textContent = CATL[t.cat];
    document.getElementById('sheetTitle').textContent = t.title;
    document.getElementById('sheetMeta').textContent = t.info;
    document.getElementById('sheetSyn').textContent = t.syn;
    var isM = t.cat === 'manga';
    document.getElementById('epLabel').textContent = isM ? 'Chapter' : 'Episode';
    document.getElementById('sheetWatch').textContent = isM ? '▶ Mulai baca' : '▶ Mulai nonton';
    var n = parseInt((t.info.match(/\d+/)||[12])[0], 10), eps = '';
    for (var e = 1; e <= Math.min(n, 24); e++) eps += '<button>'+(isM?'CH ':'EP ')+e+'</button>';
    document.getElementById('epList').innerHTML = eps;
    document.getElementById('sheetSave').textContent = inWL(id) ? '♥ Tersimpan' : '♡ Simpan';
    overlay.hidden = false;
  }
  document.getElementById('sheetSave').addEventListener('click', function(){ if (sheetId) toggleWL(sheetId); });
  function closeSheet(){ overlay.hidden = true; }
  document.getElementById('closeSheet').addEventListener('click', closeSheet);
  overlay.addEventListener('click', function(e){ if (e.target === overlay) closeSheet(); });

  syncAll();
})();
