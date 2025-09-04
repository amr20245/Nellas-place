

// ==== V6: Spotlight, CTA shimmer once, Reveal on scroll, Footer copy buttons ====
(function(){
  // 1) Reveal on scroll
  const candidates = document.querySelectorAll('section, .section, .card, [class*="feature"], .grid > *');
  const revealables = Array.from(candidates).filter(el => !el.classList.contains('revealed'));
  revealables.forEach(el => el.classList.add('reveal'));
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); io.unobserve(e.target); } });
    }, { rootMargin: '-12% 0px -12% 0px', threshold: 0.01 });
    revealables.forEach(el => io.observe(el));
  } else {
    revealables.forEach(el => el.classList.add('revealed'));
  }

  // 2) CTA shimmer once (first primary CTA in hero)
  const hero = document.querySelector('[class*="hero"], .hero, section.hero');
  if (hero) {
    const cta = hero.querySelector('a.btn, a.button, .btn-primary, .btn-cta, button.btn, a[role="button"]');
    if (cta) {
      cta.classList.add('cta-shimmer-once');
      setTimeout(()=>cta.classList.remove('cta-shimmer-once'), 1800);
    }
  }

  // 3) Cursor spotlight on hero area following pointer
  if (hero && window.matchMedia('(pointer:fine)').matches) {
    const host = hero.querySelector('.hero-rotator') || hero;
    const layer = document.createElement('div');
    layer.className = 'cursor-spotlight is-idle';
    host.style.position = host.style.position || 'relative';
    host.appendChild(layer);
    const move = (e)=>{
      const r = host.getBoundingClientRect();
      const x = (e.clientX - r.left), y = (e.clientY - r.top);
      layer.style.setProperty('--x-translate', ${x}px);
      layer.style.setProperty('--y-translate', f`${y}px`);
      layer.classList.remove('is-idle');
    };
    host.addEventListener('mousemove', move);
    host.addEventListener('mouseleave', () => { layer.classList.add('is-idle'); });
  }

  // 4) Footer copy buttons for Address / Email / Phone
  const footer = document.querySelector('footer');
  if (footer && navigator.clipboard) {
    const addCopyBtn = (labelEl, getText) => {
      if (!labelEl) return;
      const btn = document.createElement('button');
      btn.className = 'copy-btn'; btn.type = 'button'; btn.textContent = 'Copy';
      btn.addEventListener('click', async () => {
        try {
          const txt = getText().trim();
          await navigator.clipboard.writeText(txt);
          btn.textContent = 'Copied!'; btn.classList.add('copied');
          setTimeout(()=>{ btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 1200);
        } catch(e) {}
      });
      labelEl.parentElement.insertBefore(btn, labelEl.nextSibling);
    };
    const nodes = Array.from(footer.querySelectorAll('*'));
    const addrLabel = nodes.find(n => /address/i.test(n.textContent||'') && n.tagName.match(/(STRONG|B|DT|P|H\d)/));
    const emailLabel = nodes.find(n => /email/i.test(n.textContent||'') && n.tagName.match(/(STRONG|B|DT|P|H\d)/));
    const phoneLabel = nodes.find(n => /phone/i.test(n.textContent||'') && n.tagName.match(/(STRONG|B|DT|P|H\d)/));
    const addrTextNode = nodes.find(n => /[0-9].*,\s*[A-Za-z].*\d{5}/.test(n.textContent||'') && !/address/i.test(n.textContent||''));
    const emailLink = footer.querySelector('a[href^="mailto:"]');
    const phoneLink = footer.querySelector('a[href^="tel:"]');
    addCopyBtn(addrLabel || addrTextNode, () => (addrTextNode?.textContent || '').replace(/\s+/g,' ').trim());
    addCopyBtn(emailLabel || emailLink, () => (emailLink?.textContent || emailLink?.getAttribute('href')?.replace('mailto:','') || ''));
    addCopyBtn(phoneLabel || phoneLink, () => (phoneLink?.textContent || phoneLink?.getAttribute('href')?.replace('tel:','') || ''));
  }
})();