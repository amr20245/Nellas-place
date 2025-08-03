
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


