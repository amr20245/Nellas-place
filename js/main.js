// SHNP Redesign • One JS for all pages
(function(){
  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.menu-toggle');
  const dropdown = document.getElementById('hamburger-dropdown');

  // Toggle nav open for mobile UL and the dropdown
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));

      // Manage focus for a11y
      const firstItem = dropdown?.querySelector('a');
      if (open && firstItem) {
        // give the animation a tick then focus
        setTimeout(() => firstItem.setAttribute('tabindex','0'), 1);
        setTimeout(() => firstItem.focus(), 120);
      } else if (dropdown) {
        dropdown.querySelectorAll('a').forEach(a => a.setAttribute('tabindex','-1'));
      }
    });
  }

  // Close on outside click
  document.addEventListener('click', e => {
    if (!nav) return;
    const clickedInside = e.target.closest('.nav');
    if (!clickedInside && nav.classList.contains('open')) {
      nav.classList.remove('open');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
      if (dropdown) dropdown.querySelectorAll('a').forEach(a => a.setAttribute('tabindex','-1'));
    }
  });

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && nav?.classList.contains('open')) {
      nav.classList.remove('open');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
      if (dropdown) dropdown.querySelectorAll('a').forEach(a => a.setAttribute('tabindex','-1'));
      if (toggle) toggle.focus();
    }
  });

  // Active link highlighting
  const here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('.nav a[href]').forEach(a => {
    const href = a.getAttribute('href');
    if (!href) return;
    const file = href.split('/').pop().toLowerCase();
    if (file === here) a.classList.add('active');
  });

  // Reveal on scroll (guard for old browsers)
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

  // Smooth scroll for on page anchors
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });

  // Basic client side form validation
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

/* Seamless marquee for top strip */
document.addEventListener('DOMContentLoaded', () => {
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('.top-strip .scroller').forEach(scroller => {
    const items = Array.from(scroller.querySelectorAll('span'));
    if (!items.length) return;

    let track = scroller.querySelector('.scroller__track');
    if (!track) {
      track = document.createElement('div');
      track.className = 'scroller__track';
      items.forEach(el => track.appendChild(el));
      items.forEach(el => {
        const clone = el.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        track.appendChild(clone);
      });
      scroller.innerHTML = '';
      scroller.appendChild(track);
    }

    if (reduced) {
      track.style.animation = 'none';
      return;
    }

    const setDuration = () => {
      const halfWidth = track.scrollWidth / 2;
      const PX_PER_SECOND = 30;
      const seconds = Math.max(halfWidth / PX_PER_SECOND, 10);
      scroller.style.setProperty('--ticker-duration', `${seconds}s`);
    };

    const updateWithRAF = () => {
      cancelAnimationFrame(updateWithRAF._raf);
      updateWithRAF._raf = requestAnimationFrame(setDuration);
    };

    if (document.fonts?.ready) document.fonts.ready.then(setDuration);
    window.addEventListener('load', setDuration);
    window.addEventListener('resize', updateWithRAF);
    setDuration();
  });
});
// SHNP global nav, ticker, and reveal helper
(function () {
  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.menu-toggle');
  const dropdown = document.getElementById('hamburger-dropdown');

  function setOpen(open) {
    if (!nav || !toggle) return;
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    if (open) {
      const first = dropdown?.querySelector('a');
      first && first.focus();
    }
  }

  if (toggle) {
    toggle.addEventListener('click', () => setOpen(!nav.classList.contains('open')));
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') setOpen(false);
  });
  document.addEventListener('click', e => {
    if (!nav?.classList.contains('open')) return;
    if (!e.target.closest('.menu-wrap')) setOpen(false);
  });

  // active link highlight
  const here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('.nav a[href]').forEach(a => {
    const file = a.getAttribute('href')?.split('/').pop().toLowerCase();
    if (file === here) a.classList.add('active');
  });

  // ticker clone for seamless loop
  const track = document.querySelector('[data-ticker-track]');
  if (track && !track.dataset.cloned) {
    track.dataset.cloned = 'true';
    const clone = track.cloneNode(true);
    track.parentNode.appendChild(clone);
  }

  // reveal on scroll
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
})();
