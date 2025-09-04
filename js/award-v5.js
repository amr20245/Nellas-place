
// ===== Award V5: Hero image slideshow synced with dots =====
(function(){
  try {
    // Only act on the home page hero (first hero-like section)
    const hero = document.querySelector('[class*="hero"], .hero, section.hero');
    if (!hero) return;

    // Find the hero's main image (right card). We'll wrap it in .hero-spot.
    let img = hero.querySelector('img');
    const heroImgs = Array.from(hero.querySelectorAll('img'));
    if (heroImgs.length) {
      img = heroImgs.slice().sort((a,b)=>{
        const ar = a.getBoundingClientRect(); const br = b.getBoundingClientRect();
        return (br.width*br.height) - (ar.width*ar.height);
      })[0];
    }
    if (!img) return;

    // Wrap for fade stack
    let spot = img.closest('.hero-spot');
    if (!spot) {
      spot = document.createElement('div');
      spot.className = 'hero-spot';
      img.parentNode.insertBefore(spot, img);
      spot.appendChild(img);
    }
    const stack = document.createElement('div');
    stack.className = 'fade-stack';
    spot.appendChild(stack);

    // Build slides from "Recent Adventures" thumbnails if present,
    // otherwise collect the first 5 images on the page.
    const normalizeSrc = (src) => (src || '').replace(/(\?.*)$/,'');
    let thumbs = [];
    const headings = Array.from(document.querySelectorAll('h2, h3'));
    const adventuresHeading = headings.find(h => /recent adventures/i.test(h.textContent || ''));
    if (adventuresHeading) {
      let section = adventuresHeading.closest('section');
      if (!section) {
        // climb up a bit and then forward scan for sibling container with images
        let node = adventuresHeading.parentElement;
        for (let i=0; i<3 && node && node.querySelectorAll('img').length===0; i++) node = node.parentElement;
        section = node || adventuresHeading.parentElement;
      }
      thumbs = Array.from((section || document).querySelectorAll('img'));
    }
    if (thumbs.length < 3) thumbs = Array.from(document.querySelectorAll('main img, body img'));
    const slides = thumbs
      .map(t => t.currentSrc || t.src)
      .map(normalizeSrc)
      .filter((s, i, arr) => s && arr.indexOf(s) === i)
      .slice(0, 5);

    if (slides.length === 0) return;

    // Create images in the stack
    const imgs = slides.map((src, i) => {
      const el = document.createElement('img');
      el.src = src;
      if (i === 0) el.classList.add('is-live');
      stack.appendChild(el);
      return el;
    });

    // Build / attach hero dots. If an existing group is found, reuse it.
    let dotsWrap = hero.querySelector('.hero-dots');
    if (!dotsWrap) {
      dotsWrap = document.createElement('div');
      dotsWrap.className = 'hero-dots';
      // Try to place under the hero CTAs (buttons) if found
      const ctasWrap = hero.querySelector('.btn, .btn-primary, a.button')?.parentElement || hero;
      ctasWrap.appendChild(dotsWrap);
    } else {
      // Clear any static dots
      dotsWrap.innerHTML = '';
    }

    const dots = slides.map((_, i) => {
      const d = document.createElement('div');
      d.className = 'hero-dot' + (i===0 ? ' is-active' : '');
      d.innerHTML = '<div class="progress"></div>';
      d.title = 'Slide ' + (i+1);
      dotsWrap.appendChild(d);
      d.addEventListener('click', () => go(i, true));
      return d;
    });

    let idx = 0;
    let timer = null;
    const dur = 5000;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function go(n, user){
      if (n === idx) return;
      const a = imgs[idx];
      const b = imgs[n];
      a.classList.remove('is-live');
      b.classList.add('is-live');
      dots[idx].classList.remove('is-active');
      dots[n].classList.add('is-active');
      dots.forEach((dot,i)=>dot.querySelector('.progress').style.width = i===n? '0%':'0%');
      idx = n;
      if (user) restart();
    }

    function tick(){
      const cur = dots[idx].querySelector('.progress');
      let start = performance.now();
      function step(ts){
        const t = Math.min(1, (ts - start) / dur);
        cur.style.width = (t*100).toFixed(2) + '%';
        if (t >= 1){
          const next = (idx + 1) % imgs.length;
          go(next, false);
          start = performance.now();
        }
        timer = requestAnimationFrame(step);
      }
      timer = requestAnimationFrame(step);
    }

    function stop(){ if (timer) cancelAnimationFrame(timer); timer = null; }
    function restart(){ stop(); if (!reduced) tick(); }

    // Pause on hover (desktop)
    if (window.matchMedia('(pointer:fine)').matches) {
      spot.addEventListener('mouseenter', stop);
      spot.addEventListener('mouseleave', restart);
    }

    // Start
    if (!reduced) tick();
  } catch(e){
    console.warn('award-v5 hero error', e);
  }
})();
