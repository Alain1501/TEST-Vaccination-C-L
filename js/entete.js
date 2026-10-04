/* =====================================================================
   BANDEAU DES LOGOS — toujours sur une seule ligne horizontale
   Partagé par l'accueil, le collège, le lycée et les deux formulaires.
   Ordinateur : les logos se réduisent légèrement si la place manque.
   Téléphone : bandeau défilant en continu si tous les logos ne tiennent pas
   (glissement manuel si l'utilisateur a désactivé les animations).
   Chargé avec : <script src="js/entete.js" defer></script>
   ===================================================================== */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var css = '' +
    '.headerLogos{display:flex!important;flex-wrap:nowrap!important;align-items:center;justify-content:center;min-width:0;max-width:100%;overflow:hidden;position:relative}' +
    '.logoTrack{display:flex;flex-wrap:nowrap;align-items:center;gap:var(--logoGap,26px);flex:0 0 auto}' +
    '.logoTrack a{flex:0 0 auto;display:inline-flex}' +
    '.headerLogos .logoTrack img{height:var(--logoH,46px)!important;width:auto!important;max-width:none!important;object-fit:contain;display:block}' +
    '.headerLogos.isMarquee{justify-content:flex-start;-webkit-mask-image:linear-gradient(90deg,transparent,#000 7%,#000 93%,transparent);mask-image:linear-gradient(90deg,transparent,#000 7%,#000 93%,transparent)}' +
    '.headerLogos.isMarquee .logoTrack{animation:logoRoll var(--logoDur,22s) linear infinite;padding-right:var(--logoGap,26px)}' +
    '.headerLogos.isMarquee:hover .logoTrack,.headerLogos.isMarquee.paused .logoTrack{animation-play-state:paused}' +
    '.headerLogos.isScroll{justify-content:flex-start;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none}' +
    '.headerLogos.isScroll::-webkit-scrollbar{display:none}' +
    '@keyframes logoRoll{from{transform:translateX(0)}to{transform:translateX(-50%)}}' +
    '@media (max-width:768px){' +
      '.siteHeaderInner{gap:10px!important;padding:12px 0 12px!important}' +
      '.headerLogos{width:100%}' +
      '.logoTrack{--logoGap:22px}' +
      '.headerLangPicker{padding:0 16px}' +
    '}';
  var st = document.createElement('style');
  st.id = 'logoBandStyle';
  st.textContent = css;
  document.head.appendChild(st);

  function setup(box) {
    if (box.dataset.logoBand) return;
    box.dataset.logoBand = '1';
    var track = document.createElement('div');
    track.className = 'logoTrack';
    while (box.firstChild) track.appendChild(box.firstChild);
    box.appendChild(track);
    var originals = Array.prototype.slice.call(track.children);

    function reset() {
      track.querySelectorAll('[data-clone]').forEach(function (n) { n.remove(); });
      box.classList.remove('isMarquee', 'isScroll', 'paused');
      track.style.removeProperty('--logoH');
    }

    function fit() {
      reset();
      var mobile = window.innerWidth <= 768;
      var h = mobile ? 32 : 46;
      track.style.setProperty('--logoH', h + 'px');
      // Ordinateur : on réduit doucement la hauteur avant d'envisager le défilement
      if (!mobile) {
        while (track.scrollWidth > box.clientWidth + 1 && h > 30) {
          h -= 2;
          track.style.setProperty('--logoH', h + 'px');
        }
      }
      if (track.scrollWidth <= box.clientWidth + 1) return;
      if (reduce) { box.classList.add('isScroll'); return; }
      // Téléphone (ou écran trop étroit) : bandeau défilant continu
      originals.forEach(function (n) {
        var c = n.cloneNode(true);
        c.setAttribute('data-clone', '1');
        c.setAttribute('aria-hidden', 'true');
        c.setAttribute('tabindex', '-1');
        track.appendChild(c);
      });
      var width = track.scrollWidth / 2;
      track.style.setProperty('--logoDur', Math.max(14, width / 28) + 's');
      box.classList.add('isMarquee');
    }

    var ready = 0;
    var imgs = track.querySelectorAll('img');
    function maybeFit() { ready++; if (ready >= imgs.length) fit(); }
    imgs.forEach(function (im) {
      if (im.complete) maybeFit();
      else { im.addEventListener('load', maybeFit); im.addEventListener('error', maybeFit); }
    });
    if (!imgs.length) fit();
    var t;
    window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(fit, 150); });
    box.addEventListener('touchstart', function () { box.classList.add('paused'); }, { passive: true });
    box.addEventListener('touchend', function () { setTimeout(function () { box.classList.remove('paused'); }, 1200); }, { passive: true });
    box.addEventListener('focusin', function () { box.classList.add('paused'); });
    box.addEventListener('focusout', function () { box.classList.remove('paused'); });
  }

  function init() { document.querySelectorAll('.headerLogos').forEach(setup); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
