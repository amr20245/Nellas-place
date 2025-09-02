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
    const required = form.querySelectorAll('[required]');

    const showError = el => {
      const container = el.closest('.field') || el.parentElement;
      let msg = container.querySelector('.error');
      if (!msg) {
        msg = document.createElement('span');
        msg.className = 'error';
        msg.setAttribute('aria-live', 'polite');
        msg.textContent = 'This field is required.';
        container.appendChild(msg);
      }
      el.classList.add('invalid');
    };

    const clearError = el => {
      const container = el.closest('.field') || el.parentElement;
      const msg = container.querySelector('.error');
      if (msg) msg.remove();
      el.classList.remove('invalid');
    };

    required.forEach(el => {
      el.addEventListener('input', () => {
        if (el.value.trim()) clearError(el);
      });
    });

    form.addEventListener('submit', e => {
      let ok = true;
      required.forEach(el => {
        if (!el.value.trim()) {
          if (ok) el.focus();
          showError(el);
          ok = false;
        } else {
          clearError(el);
        }
      });
      if (!ok) e.preventDefault();
    });

    form.addEventListener('reset', () => {
      required.forEach(clearError);
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

// =====================================================================
// Theme Toggle
// Create a floating button that toggles between light and dark modes.
// It stores the user's preference in localStorage and applies the theme
// on subsequent visits. The button lives at the bottom-left of every
// page and updates its icon based on the current mode.
// =====================================================================
document.addEventListener('DOMContentLoaded', () => {
  const htmlEl = document.documentElement;
  // Apply stored theme preference on load
  const stored = localStorage.getItem('theme');
  if (stored === 'dark') {
    htmlEl.classList.add('dark');
  }
  // Create toggle button
  const btn = document.createElement('button');
  btn.id = 'theme-toggle';
  btn.type = 'button';
  btn.title = 'Toggle dark mode';
  // Set initial icon
  btn.textContent = htmlEl.classList.contains('dark') ? '☀️' : '🌙';
  document.body.appendChild(btn);
  // Toggle handler
  btn.addEventListener('click', () => {
    const dark = htmlEl.classList.toggle('dark');
    btn.textContent = dark ? '☀️' : '🌙';
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  });

  // -----------------------------------------------------------------
  // Hero slider initialization
  // Looks for any element with class `.hero-slider .slider` and wires up
  // simple slide switching with dots. The markup should include
  // articles with class `slide`, optional prev/next buttons, and a
  // container for dots (div.slider-dots). Data attributes control
  // autoplay and interval durations. Arrows are hidden via CSS if not
  // desired. Adapted from the about-nellas page for reuse.
  (function(){
    const sliders = document.querySelectorAll('.hero-slider .slider');
    sliders.forEach(slider => {
      const slides = Array.from(slider.querySelectorAll('.slide'));
      if (!slides.length) return;
      const dotsWrap = slider.querySelector('.slider-dots');
      const btnPrev = slider.querySelector('.prev');
      const btnNext = slider.querySelector('.next');
      let i = 0;
      const autoplay = slider.dataset.autoplay === 'true';
      const interval = parseInt(slider.dataset.interval, 10) || 7000;
      let timer;
      function go(n){
        slides[i].classList.remove('active');
        if (dotsWrap?.children[i]) dotsWrap.children[i].setAttribute('aria-selected','false');
        i = (n + slides.length) % slides.length;
        slides[i].classList.add('active');
        if (dotsWrap?.children[i]) dotsWrap.children[i].setAttribute('aria-selected','true');
      }
      slides.forEach((_, idx) => {
        if (!dotsWrap) return;
        const b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('role','tab');
        b.setAttribute('aria-selected', idx === 0 ? 'true' : 'false');
        b.addEventListener('click', () => { go(idx); restart(); });
        dotsWrap.appendChild(b);
      });
      slides[0].classList.add('active');
      function next(){ go(i + 1); }
      function prev(){ go(i - 1); }
      if (btnNext) btnNext.addEventListener('click', () => { next(); restart(); });
      if (btnPrev) btnPrev.addEventListener('click', () => { prev(); restart(); });
      function start(){ if (autoplay) timer = setInterval(next, interval); }
      function stop(){ clearInterval(timer); }
      function restart(){ stop(); start(); }
      slider.addEventListener('mouseenter', stop);
      slider.addEventListener('mouseleave', start);
      start();
    });
  })();

  // -----------------------------------------------------------------
  // Footer augmentation: insert our address and phone into the contact
  // list if not already present. The client provided an updated
  // location on California Avenue and wants a global SHNP phone number
  // displayed on every page. This helper runs once per page load and
  // gracefully avoids duplication.
  (function(){
    const contact = document.querySelector('.footer__contact');
    if (!contact) return;
    const existing = contact.innerText || '';
    // California Avenue address for SHNP
    const addressText = 'California Ave, Cincinnati, OH 45237';
    const phoneNumber  = '513-436-0118';
    if (!existing.includes(addressText)) {
      const addrEl = document.createElement('div');
      addrEl.textContent = `📍 ${addressText}`;
      contact.appendChild(addrEl);
    }
    if (!existing.includes(phoneNumber)) {
      const phoneEl = document.createElement('div');
      phoneEl.innerHTML = `📞 <a href="tel:+1${phoneNumber.replace(/[^0-9]/g,'')}">${phoneNumber}</a>`;
      contact.appendChild(phoneEl);
    }
  })();

  // -----------------------------------------------------------------
  // Mobile nav augmentation: copy primary nav links into the hamburger
  // dropdown so they remain accessible on phones. Without this the
  // primary navigation disappears completely on small screens.
  (function(){
    const mainNavList = document.querySelector('.nav > ul');
    const dropdown = document.getElementById('hamburger-dropdown');
    if (!mainNavList || !dropdown) return;
    // Only duplicate primary navigation into the hamburger menu on narrow
    // viewports. On desktop, the primary nav is visible so adding
    // duplicates just clutters the dropdown. We check the current
    // window width at page load; if it’s below 900px we copy the
    // links, otherwise we leave the dropdown untouched. This avoids
    // duplication on larger screens.
    const isMobile = window.innerWidth <= 900;
    if (!isMobile) return;
    const existingLinks = Array.from(dropdown.querySelectorAll('a')).map(a => a.getAttribute('href'));
    mainNavList.querySelectorAll('a').forEach(a => {
      const href = a.getAttribute('href');
      if (!href || existingLinks.includes(href)) return;
      const clone = a.cloneNode(true);
      clone.setAttribute('role','menuitem');
      clone.setAttribute('tabindex','-1');
      dropdown.insertBefore(clone, dropdown.firstChild);
    });
  })();
});
