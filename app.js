// animehub v4 — cinematic mockup
(function () {
  'use strict';

  var GRADS = ['g1','g2','g3','g4','g5','g6'];
  var TITLES = [
    {id:'a1', title:'Judul Anime A',   jp:'物語', cat:'anime',   info:'EP 24 • ★ 4.9 • Aksi', syn:'Seorang pemuda biasa menemukan kekuatan tersembunyi dan harus melindungi kotanya dari ancaman yang datang setiap malam.', day:0, time:'17:00', feat:1, fcls:'f1'},
    {id:'d1', title:'Judul Donghua B', jp:'仙侠', cat:'donghua', info:'EP 40 • ★ 4.8 • Fantasi', syn:'Kultivator muda menapaki jalan panjang menuju keabadian, melewati ujian sekte dan intrik dunia persilatan.', day:1, time:'18:00', feat:1, fcls:'f2'},
    {id:'m1', title:'Judul Manga C',   jp:'料理', cat:'manga',   info:'CH 112 • ★ 4.9 • Full color', syn:'Seorang koki jalanan berkompetisi di turnamen masak bawah tanah demi melunasi utang keluarganya.', day:2, time:'12:00', feat:1, fcls:'f3'},
    {id:'a2', title:'Judul Anime D',   cat:'anime',   info:'EP 8 • ★ 4.7',  syn:'Petualangan sekelompok sahabat menembus dungeon misterius.', day:3, time:'19:30'},
    {id:'a3', title:'Judul Anime E',   cat:'anime',   info:'EP 12 • ★ 4.8', syn:'Drama sekolah yang hangat tentang persahabatan dan mimpi.', day:5, time:'16:00'},
    {id:'d2', title:'Judul Donghua F', cat:'donghua', info:'EP 16 • ★ 4.6', syn:'Putri terbuang membangun kembali kekuatannya.', day:4, time:'20:00'},
    {id:'m2', title:'Judul Manga G',   cat:'manga',   info:'CH 45 • ★ 4.7', syn:'Hunter peringkat rendah membangkitkan sistem misterius.', day:6, time:'10:00'},
    {id:'m3', title:'Judul Manga H',   cat:'manga',   info:'CH 78 • ★ 4.5', syn:'Romansa kantor yang manis antara dua rival divisi.', day:2, time:'12:00'}
  ];
  var DAYS = ['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu'];
  var CATL = {anime:'ANIME', donghua:'DONGHUA', manga:'MANGA'};
  var todayIdx = (new Date().getDay() + 6) % 7;
  var curDay = todayIdx;

  var WL_KEY = 'ah_watchlist_v4';
  function getWL(){ try { return JSON.parse(localStorage.getItem(WL_KEY)) || []; } catch(e){ return []; } }
  function setWL(a){ localStorage.setItem(WL_KEY, JSON.stringify(a)); syncSave(); }
  function inWL(id){ return getWL().indexOf(id) !== -1; }
  function toggleWL(id){
    var w = getWL(), i = w.indexOf(id);
    if (i === -1) w.push(id); else w.splice(i, 1);
    setWL(w);
  }
  function grad(t){ return GRADS[TITLES.indexOf(t) % GRADS.length]; }
  function byId(id){ return TITLES.filter(function(t){ return t.id === id; })[0]; }
  function syncSave(){
    document.querySelectorAll('[data-save]').forEach(function (b) {
      b.classList.toggle('on', inWL(b.dataset.save));
    });
    if (sheetId) document.getElementById('sheetSave').textContent = inWL(sheetId) ? '♥ Tersimpan' : '♡ Simpan';
    if (heroId) document.getElementById('hSave').classList.toggle('on', inWL(heroId));
  }

  // ---- hero slides ----
  var feats = TITLES.filter(function(t){ return t.feat; });
  var cur = 0, heroId = null, timer = null;
  function renderSlides(){
    document.getElementById('slides').innerHTML = feats.map(function (t, i) {
      return '<div class="slide '+t.fcls+(i===0?' on':'')+'"></div>';
    }).join('');
    document.getElementById('dots').innerHTML = feats.map(function (_, i) {
      return '<i class="'+(i===0?'on':'')+'"></i>';
    }).join('');
  }
  function showSlide(i){
    cur = (i + feats.length) % feats.length;
    var t = feats[cur]; heroId = t.id;
    document.querySelectorAll('.slide').forEach(function (s, k) { s.classList.toggle('on', k === cur); });
    document.querySelectorAll('.dots i').forEach(function (d, k) { d.classList.toggle('on', k === cur); });
    document.getElementById('hJp').textContent = t.jp;
    document.getElementById('hTitle').textContent = t.title;
    document.getElementById('hMeta').textContent = t.info;
    document.getElementById('hSyn').textContent = t.syn;
    document.getElementById('hWatch').textContent = t.cat === 'manga' ? '▶ Baca' : '▶ Tonton';
    syncSave();
    restart();
  }
  function restart(){ clearInterval(timer); timer = setInterval(function(){ showSlide(cur + 1); }, 7000); }
  document.getElementById('prevSlide').addEventListener('click', function(){ showSlide(cur - 1); });
  document.getElementById('nextSlide').addEventListener('click', function(){ showSlide(cur + 1); });
  document.getElementById('hDetail').addEventListener('click', function(){ if (heroId) openSheet(heroId); });
  document.getElementById('hWatch').addEventListener('click', function(){ if (heroId) openSheet(heroId); });
  document.getElementById('hSave').addEventListener('click', function(){
    if (!heroId) return;
    toggleWL(heroId);
    document.getElementById('hSave').textContent = inWL(heroId) ? '♥' : '♡';
  });

  // ---- top 10 ----
  function renderTop(){
    document.getElementById('topRail').innerHTML = TITLES.map(function (t, i) {
      return '<div class="tcard" data-id="'+t.id+'"><span class="tnum">'+(i+1)+'</span>' +
        '<span class="tart '+grad(t)+'"><span class="tmeta"><strong>'+t.title+'</strong><small>'+t.info+'</small></span></span></div>';
    }).join('');
    document.querySelectorAll('#topRail .tcard').forEach(function (c) {
      c.addEventListener('click', function(){ openSheet(c.dataset.id); });
    });
  }

  // ---- bento ----
  var curCat = 'semua';
  var SPANS = ['w2 h2','','','h2','','w2','',''];
  function renderBento(){
    var list = TITLES.filter(function (t) {
      return curCat === 'semua' || t.cat === curCat;
    });
    document.getElementById('bento').innerHTML = list.map(function (t, i) {
      return '<button class="b '+(SPANS[i % SPANS.length])+' '+grad(t)+'" data-id="'+t.id+'">' +
        '<span class="badge">'+CATL[t.cat]+'</span>' +
        '<button class="save'+(inWL(t.id)?' on':'')+'" data-save="'+t.id+'">♡</button>' +
        '<span class="b-cap"><strong>'+t.title+'</strong><small>'+t.info+'</small></span></button>';
    }).join('');
    var b = document.getElementById('bento');
    b.querySelectorAll('.b').forEach(function (el) {
      el.addEventListener('click', function (e) {
        if (e.target.closest('[data-save]')) return;
        openSheet(el.dataset.id);
      });
    });
    b.querySelectorAll('[data-save]').forEach(function (s) {
      s.addEventListener('click', function (e) { e.stopPropagation(); toggleWL(s.dataset.save); });
    });
  }
  document.querySelectorAll('#catChips .chip').forEach(function (c) {
    c.addEventListener('click', function(){
      curCat = c.dataset.cat;
      document.querySelectorAll('#catChips .chip').forEach(function(x){ x.classList.toggle('on', x===c); });
      renderBento();
    });
  });

  // ---- jadwal ----
  function renderDays(){
    var now = new Date(), monday = new Date(now);
    monday.setDate(now.getDate() - todayIdx);
    document.getElementById('dayPills').innerHTML = DAYS.map(function (d, i) {
      var dt = new Date(monday); dt.setDate(monday.getDate() + i);
      return '<button class="day'+(i===curDay?' on':'')+'" data-d="'+i+'">'+d.slice(0,3)+' '+dt.getDate()+'</button>';
    }).join('');
    document.querySelectorAll('#dayPills .day').forEach(function (b) {
      b.addEventListener('click', function(){ curDay = +b.dataset.d; renderDays(); renderSched(); });
    });
  }
  function renderSched(){
    var list = TITLES.filter(function(t){ return t.day === curDay; });
    document.getElementById('sched').innerHTML = list.length ? list.map(function (t) {
      return '<div class="srow" data-id="'+t.id+'"><span class="sdot '+grad(t)+'"></span>' +
        '<span><strong>'+t.title+'</strong><small>'+t.info+'</small></span>' +
        '<span class="time">'+t.time+'</span></div>';
    }).join('') : '<p style="color:var(--mut)">Tidak ada rilis hari '+DAYS[curDay].toLowerCase()+'.</p>';
    document.querySelectorAll('#sched .srow').forEach(function (r) {
      r.addEventListener('click', function(){ openSheet(r.dataset.id); });
    });
  }

  // ---- search overlay ----
  var so = document.getElementById('soverlay'), sq = document.getElementById('sq');
  document.getElementById('searchBtn').addEventListener('click', function(){
    so.hidden = false; sq.value = ''; renderS(''); setTimeout(function(){ sq.focus(); }, 50);
  });
  function closeS(){ so.hidden = true; }
  so.addEventListener('click', function(e){ if (e.target === so) closeS(); });
  sq.addEventListener('input', function(){ renderS(sq.value.trim().toLowerCase()); });
  function renderS(q){
    var list = TITLES.filter(function (t) { return !q || t.title.toLowerCase().indexOf(q) !== -1; });
    document.getElementById('sres').innerHTML = list.map(function (t) {
      return '<button class="sr" data-id="'+t.id+'"><span class="sdot '+grad(t)+'"></span>' +
        '<span><strong>'+t.title+'</strong><small>'+CATL[t.cat]+' • '+t.info+'</small></span></button>';
    }).join('') || '<p style="color:var(--mut)">Tidak ada hasil.</p>';
    document.querySelectorAll('#sres .sr').forEach(function (r) {
      r.addEventListener('click', function(){ closeS(); openSheet(r.dataset.id); });
    });
  }

  // ---- detail ----
  var overlay = document.getElementById('overlay'), sheetId = null;
  function openSheet(id){
    var t = byId(id); if (!t) return;
    sheetId = id;
    document.getElementById('sheetBg').className = 'sheet-bg ' + grad(t);
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
    syncSave();
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
  }
  document.getElementById('sheetSave').addEventListener('click', function(){ if (sheetId) toggleWL(sheetId); });
  function close(){ overlay.hidden = true; document.body.style.overflow = ''; }
  document.getElementById('closeSheet').addEventListener('click', close);
  overlay.addEventListener('click', function(e){ if (e.target === overlay) close(); });
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape') { close(); closeS(); }
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      document.getElementById('searchBtn').click();
    }
  });

  renderSlides(); showSlide(0); renderTop(); renderBento(); renderDays(); renderSched();
})();
