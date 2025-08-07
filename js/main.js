// SHNP Redesign • One JS for all pages
(function(){
  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.menu-toggle');
  if (toggle) {
    toggle.addEventListener('click', () => nav.classList.toggle('open'));
  }

  // Active link highlighting
  const here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('.nav a[href]').forEach(a => {
    const href = a.getAttribute('href');
    if (!href) return;
    const file = href.split('/').pop().toLowerCase();
    if (file === here) a.classList.add('active');
  });

  // Reveal-on-scroll (guard for old browsers)
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: .12 });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
  } else {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
  }

  // Smooth scroll for on-page anchors
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });

  // Basic client-side form validation
  document.querySelectorAll('form[data-validate]')?.forEach(form => {
    form.addEventListener('submit', e => {
      const required = form.querySelectorAll('[required]');
      let ok = true;
      required.forEach(el => {
        if (!el.value.trim()) { el.classList.add('invalid'); ok = false; }
        else { el.classList.remove('invalid'); }
      });
      if (!ok) {
        e.preventDefault();
        alert('Please complete required fields.');
      }
    });
  });
})();

/* ───────────────────────────
   Seamless marquee for top strip
   - Supports multiple .scroller elements
   - Duplicates content for infinite loop
   - Auto speed based on content width
   - Respects reduced motion
   ─────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('.top-strip .scroller').forEach(scroller => {
    // Collect items (spans) in this scroller
    const items = Array.from(scroller.querySelectorAll('span'));
    if (!items.length) return;

    // Build track only if not already built
    let track = scroller.querySelector('.scroller__track');
    if (!track) {
      track = document.createElement('div');
      track.className = 'scroller__track';

      // Move originals into track
      items.forEach(el => track.appendChild(el));

      // Duplicate once for seamless loop
      items.forEach(el => {
        const clone = el.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        track.appendChild(clone);
      });

      // Mount
      scroller.innerHTML = '';
      scroller.appendChild(track);
    }

    // Skip animation entirely if user prefers reduced motion
    if (reduced) {
      track.style.animation = 'none';
      return;
    }

    // Set speed based on content width for consistent px/sec
    const setDuration = () => {
      // track holds two copies; halfWidth = one copy
      const halfWidth = track.scrollWidth / 2;
      const PX_PER_SECOND = 30;                // ← tweak speed here
      const seconds = Math.max(halfWidth / PX_PER_SECOND, 10);
      scroller.style.setProperty('--ticker-duration', `${seconds}s`);
    };

    const updateWithRAF = () => {
      cancelAnimationFrame(updateWithRAF._raf);
      updateWithRAF._raf = requestAnimationFrame(setDuration);
    };

    // Recompute after fonts load & on resize
    if (document.fonts?.ready) document.fonts.ready.then(setDuration);
    window.addEventListener('load', setDuration);
    window.addEventListener('resize', updateWithRAF);

    setDuration();
  });
});
