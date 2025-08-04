
// SHNP Redesign • One JS for all pages
(function(){
  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.menu-toggle');
  if(toggle){
    toggle.addEventListener('click', ()=>{
      nav.classList.toggle('open');
    });
  }

  // Active link highlighting
  const here = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav a').forEach(a=>{
    const href = a.getAttribute('href');
    if(href && href.endsWith(here)){ a.classList.add('active'); }
  });

  // Reveal-on-scroll
  const io = new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){ e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, {threshold:.12});
  document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

  // Smooth scroll for on-page anchors
  document.addEventListener('click', (e)=>{
    const a = e.target.closest('a[href^="#"]');
    if(!a) return;
    const id = a.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if(target){ e.preventDefault(); target.scrollIntoView({behavior:'smooth', block:'start'}); }
  });

  // Basic client-side form validation
  document.querySelectorAll('form[data-validate]')?.forEach(form=>{
    form.addEventListener('submit', (e)=>{
      const required = form.querySelectorAll('[required]');
      let ok = true;
      required.forEach(el=>{
        if(!el.value.trim()){ el.classList.add('invalid'); ok=false; }
        else{ el.classList.remove('invalid'); }
      });
      if(!ok){
        e.preventDefault();
        alert('Please complete required fields.');
      }
    });
  });
})();


document.addEventListener('DOMContentLoaded', () => {
  const scroller = document.querySelector('.top-strip .scroller');
  if (!scroller) return;

  // Collect the original items (<span>…</span>)
  const items = Array.from(scroller.querySelectorAll('span'));
  if (items.length === 0) return;

  // Build the animated track and duplicate content for seamless loop
  const track = document.createElement('div');
  track.className = 'scroller__track';

  // Move originals into the track
  items.forEach(el => track.appendChild(el));

  // Duplicate them (aria-hidden so screen readers don't repeat)
  items.forEach(el => {
    const clone = el.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
  });

  // Mount the track
  scroller.innerHTML = '';
  scroller.appendChild(track);

  // Set animation duration based on content width for consistent speed
  const setDuration = () => {
    // track now holds 2 copies; halfWidth is width of one copy
    const halfWidth = track.scrollWidth / 2;
    const pxPerSecond = 20;                 // ← adjust speed here           ------------------
    const seconds = Math.max(halfWidth / pxPerSecond, 10);
    scroller.style.setProperty('--ticker-duration', `${seconds}s`);
  };

  // Recompute after fonts load & on resize
  if (document.fonts?.ready) document.fonts.ready.then(setDuration);
  window.addEventListener('load', setDuration);
  window.addEventListener('resize', () => {
    // debounce with rAF for smoothness
    cancelAnimationFrame(setDuration._raf);
    setDuration._raf = requestAnimationFrame(setDuration);
  });

  setDuration();
});
