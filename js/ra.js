
(function(){
  const root = document.querySelector('#recent-adventures-3d');
  if(!root) return;

  const stage = root.querySelector('.ra-stage');
  const ring = stage.querySelector('.ra-ring');
  const cards = [...stage.querySelectorAll('.ra-card')];
  const dotsWrap = root.querySelector('.ra-dots'); // dots live in footer
  const prev = stage.querySelector('.ra-prev');
  const next = stage.querySelector('.ra-next');

  const N = cards.length;
  const theta = 360 / N;
  const radius = parseFloat(stage.dataset.radius || 440);
  const auto = (stage.dataset.auto || 'true') !== 'false';
  const speed = parseFloat(stage.dataset.speed || .05); // deg/ms
  let acc = 0, last = performance.now(), rafId;
  let currentIndex = 0;

  function positionCards(offset = 0){
    cards.forEach((card, i)=>{
      const angle = theta * i + offset;
      card.style.transform = `translate(-50%,-50%) rotateY(${angle}deg) translateZ(${radius}px)`;

      const img = card.querySelector('img');
      img.style.animation = `ra-bob ${4 + (i%3)}s ease-in-out ${-i*0.25}s infinite`;

      const rad = (angle + acc) * Math.PI/180;
      const facing = Math.cos(rad);
      const bright = 0.65 + 0.35 * Math.max(0, facing);
      const blur = 4 + 12 * (1 - Math.max(0, facing));
      card.style.filter = `brightness(${bright}) drop-shadow(0 10px ${blur}px rgba(0,0,0,0.33))`;
      card.style.zIndex = String(100 + Math.round(50 * facing));
    });
  }

  // Build dots in footer
  let dots = [];
  if (dotsWrap) {
    dots = cards.map((_,i)=>{
      const b = document.createElement('button');
      b.setAttribute('aria-label', `Show card ${i+1}`);
      b.addEventListener('click', ()=>{ goTo(i); pause(); });
      dotsWrap.appendChild(b);
      return b;
    });
  }
  function markDot(idx){
    if(!dots.length) return;
    dots.forEach((d,j)=> d.setAttribute('aria-selected', j===idx ? 'true':'false'));
  }

  function goTo(idx){
    currentIndex = (idx + N) % N;
    acc = -theta * currentIndex;
    ring.style.transform = `translateZ(-180px) rotateY(${acc}deg)`;
    markDot(currentIndex);
    positionCards(0);
  }

  function step(ts){
    const dt = ts - last; last = ts;
    if(!auto) return;
    acc += speed * dt;
    ring.style.transform = `translateZ(-180px) rotateY(${acc}deg)`;

    if(dots.length){
      const normalized = ((-acc % 360) + 360) % 360;
      const idx = Math.round(normalized / theta) % N;
      markDot(idx);
    }
    positionCards(0);
    rafId = requestAnimationFrame(step);
  }
  function play(){ if(!rafId){ last = performance.now(); rafId = requestAnimationFrame(step); } }
  function pause(){ cancelAnimationFrame(rafId); rafId = null; }

  if(prev) prev.addEventListener('click', ()=>{ goTo(currentIndex-1); pause(); });
  if(next) next.addEventListener('click', ()=>{ goTo(currentIndex+1); pause(); });

  // drag/swipe
  let dragging=false, sx=0, vx=0;
  const onDown = e => { dragging=true; sx=(e.touches?e.touches[0].clientX:e.clientX); pause(); };
  const onUp = () => { dragging=false; if(Math.abs(vx)>0.1){ goTo(currentIndex - Math.sign(vx)); } };
  const onMove = e => {
    if(!dragging) return;
    const x=(e.touches?e.touches[0].clientX:e.clientX);
    const dx=x-sx; sx=x; vx=dx*0.2;
    acc += dx*0.25;
    ring.style.transform = `translateZ(-180px) rotateY(${acc}deg)`;
    positionCards(0);
  };
  stage.addEventListener('mousedown', onDown);
  stage.addEventListener('touchstart', onDown, {passive:true});
  window.addEventListener('mouseup', onUp);
  window.addEventListener('touchend', onUp);
  stage.addEventListener('mousemove', onMove);
  stage.addEventListener('touchmove', onMove, {passive:false});

  stage.addEventListener('mouseenter', pause);
  stage.addEventListener('mouseleave', ()=>{ if(auto) play(); });

  ring.style.transform = 'translateZ(-180px) rotateY(0deg)';
  positionCards(0);
  goTo(0);
  if(auto) play();
})();
