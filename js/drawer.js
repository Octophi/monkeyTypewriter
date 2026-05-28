// drawer.js — mobile drawer toggle for the scoreboard.
// Runs after DOM is parsed; the actual show/hide is CSS-driven off
// the [data-open] attribute on #scoreBar.
//
// Also keeps a 1-line preview ("ero · det · ist") in sync with the
// personal top-5 list, since the peek bar only shows a teaser.

(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    var bar = document.getElementById('scoreBar');
    var peek = document.getElementById('scorePeek');
    var closeBtn = document.getElementById('scoreClose');
    var preview = document.getElementById('scorePeekPreview');
    var personalList = document.getElementById('topFiveList');

    if (!bar || !peek) return;

    function setOpen(open) {
      bar.setAttribute('data-open', open ? 'true' : 'false');
    }

    peek.addEventListener('click', function () { setOpen(true); });
    if (closeBtn) closeBtn.addEventListener('click', function () { setOpen(false); });

    // Close on Esc
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && bar.getAttribute('data-open') === 'true') setOpen(false);
    });

    // Keep the peek preview synced with the personal list
    function refreshPreview() {
      if (!preview || !personalList) return;
      var items = Array.prototype.map.call(
        personalList.querySelectorAll('li'),
        function (li) { return li.textContent.trim(); }
      ).filter(Boolean);
      preview.textContent = items.length ? items.join(' · ') : 'no finds yet';
    }

    if (personalList) {
      var mo = new MutationObserver(refreshPreview);
      mo.observe(personalList, { childList: true, subtree: true, characterData: true });
      refreshPreview();
    }
  });
})();
