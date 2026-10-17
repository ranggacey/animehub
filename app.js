// mockup interactions v1
(function () {
  'use strict';

  // mobile nav
  var burger = document.getElementById('burger');
  var navLinks = document.getElementById('navLinks');
  burger.addEventListener('click', function () {
    navLinks.classList.toggle('open');
    burger.textContent = navLinks.classList.contains('open') ? '✕' : '☰';
  });
  navLinks.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      navLinks.classList.remove('open');
      burger.textContent = '☰';
    }
  });

  // live search filter (demo)
  var input = document.getElementById('searchInput');
  var cards = Array.prototype.slice.call(document.querySelectorAll('#cards .card'));
  var hint = document.getElementById('searchHint');
  input.addEventListener('input', function () {
    var q = input.value.trim().toLowerCase();
    var n = 0;
    cards.forEach(function (c) {
      var hit = !q || (c.dataset.title + ' ' + c.dataset.cat).indexOf(q) !== -1;
      c.classList.toggle('hide', !hit);
      if (hit) n++;
    });
    if (q) {
      hint.hidden = false;
      hint.textContent = n ? 'Hasil untuk "' + input.value.trim() + '": ' + n + ' judul' : 'Tidak ada hasil untuk "' + input.value.trim() + '"';
    } else {
      hint.hidden = true;
    }
  });
})();
