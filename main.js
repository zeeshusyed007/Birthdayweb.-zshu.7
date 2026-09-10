// Main interactions for the birthday site
(function(){
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));

  // Smooth scroll from hero start button
  $('#startBtn')?.addEventListener('click', e => {
    document.getElementById('message').scrollIntoView({behavior:'smooth'});
  });

  // Music toggle
  const music = $('#bgMusic');
  const musicToggle = $('#musicToggle');
  function startMusicPlayback(){
    if(!music) return;
    music.volume = 0.5;
    music.muted = false;
    music.play().then(() => {
      if (musicToggle) musicToggle.textContent = 'Pause Music';
    }).catch(() => {
      if (musicToggle) musicToggle.textContent = 'Play Music';
    });
  }

  musicToggle && musicToggle.addEventListener('click', ()=>{
    if(!music) return;
    if(music.paused){ startMusicPlayback(); }
    else { music.pause(); musicToggle.textContent = 'Play Music'; }
  });

  // Surprise modal + confetti hearts (lightweight)
  const openSurprise = $('#openSurprise');
  const surpriseModal = $('#surpriseModal');
  const closeSurprise = $('#surpriseClose');
  const closeAndCelebrate = $('#closeAndCelebrate');
  const replayBtn = $('#replayBtn');

  function openModal(){
    if(!surpriseModal) return;
    surpriseModal.setAttribute('aria-hidden','false');
    surpriseModal.classList.add('open');
    startConfetti();
  }
  function closeModal(){
    if(!surpriseModal) return;
    surpriseModal.setAttribute('aria-hidden','true');
    surpriseModal.classList.remove('open');
    stopConfetti();
  }
  openSurprise?.addEventListener('click', openModal);
  replayBtn?.addEventListener('click', ()=>{ openModal(); });
  closeSurprise?.addEventListener('click', closeModal);
  closeAndCelebrate?.addEventListener('click', closeModal);

  // Lightbox
  const galleryImages = $$('#gallery .card img');
  const lightbox = $('#lightbox');
  const lightboxImg = $('#lightboxImg');
  const lbPrev = $('#lbPrev');
  const lbNext = $('#lbNext');
  const lbClose = $('#lightboxClose');
  let currentIndex = 0;

  function openLightbox(i){
    currentIndex = i;
    const src = galleryImages[i].src;
    lightboxImg.src = src;
    lightbox.classList.add('open');
  }
  function closeLightbox(){ lightbox.classList.remove('open'); }
  galleryImages.forEach((img, idx)=>{
    img.addEventListener('click', ()=>openLightbox(idx));
  });
  lbPrev?.addEventListener('click', ()=>{ currentIndex=(currentIndex-1+galleryImages.length)%galleryImages.length; lightboxImg.src = galleryImages[currentIndex].src });
  lbNext?.addEventListener('click', ()=>{ currentIndex=(currentIndex+1)%galleryImages.length; lightboxImg.src = galleryImages[currentIndex].src });
  lbClose?.addEventListener('click', closeLightbox);
  lightbox?.addEventListener('click', (e)=>{ if(e.target===lightbox) closeLightbox(); });

  // Special date display
  function initCountdown(){
    const staticDate = document.querySelector('.date-showcase');
    if(staticDate) return;

    const el = document.querySelector('.countdown');
    if(!el) return;

    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    if(!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

    const target = new Date(el.dataset.target);
    function tick(){
      const now = new Date();
      let diff = Math.max(0, target - now);
      const days = Math.floor(diff / (1000*60*60*24));
      diff -= days * (1000*60*60*24);
      const hours = Math.floor(diff / (1000*60*60));
      diff -= hours * (1000*60*60);
      const minutes = Math.floor(diff / (1000*60));
      diff -= minutes * (1000*60);
      const seconds = Math.floor(diff/1000);
      daysEl.textContent = String(days).padStart(2,'0');
      hoursEl.textContent = String(hours).padStart(2,'0');
      minutesEl.textContent = String(minutes).padStart(2,'0');
      secondsEl.textContent = String(seconds).padStart(2,'0');
    }
    tick();
    setInterval(tick,1000);
  }
  initCountdown();

  // Appear on scroll
  const fadeEls = $$('.fade-up');
  const obs = new IntersectionObserver(entries=>{
    entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('show'); });
  },{threshold:.12});
  fadeEls.forEach(el=>obs.observe(el));

  // Glowing cursor follow (optimized: use transform + requestAnimationFrame)
  const glow = $('#glow-cursor');
  if(glow){
    let mouseX = 0, mouseY = 0, rafId = null;
    document.addEventListener('mousemove', e=>{ mouseX = e.clientX; mouseY = e.clientY; if(!rafId) rafId = requestAnimationFrame(updateGlow); });
    function updateGlow(){
      // use translate3d for GPU-accelerated transforms (avoids layout)
      glow.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      rafId = null;
    }
    // hide cursor effect on touch devices to save resources
    function checkTouch(){ if(('ontouchstart' in window) || navigator.maxTouchPoints>0){ glow.style.display='none'; document.removeEventListener('mousemove', ()=>{}); }}
    checkTouch();
  }

  // Simple confetti hearts using canvas (optimized: requestAnimationFrame, capped particles)
  let confettiRaf = null;
  let confettiState = null;
  function startConfetti(){
    const cvs = document.getElementById('confetti');
    if(!cvs) return;
    const ctx = cvs.getContext('2d');
    let hearts = [];
    let lastSpawn = 0;
    function resize(){ cvs.width = cvs.offsetWidth || window.innerWidth; cvs.height = cvs.offsetHeight || window.innerHeight; }
    resize();
    window.addEventListener('resize', resize);
    confettiState = {running:true};
    function spawn(){
      if(hearts.length >= 60) return; // cap particle count
      hearts.push({x: Math.random()*cvs.width, y: -10, vx: (Math.random()-0.5)*1.2, vy: 1+Math.random()*1.6, size:6+Math.random()*10, rot:Math.random()*6, alpha:0.9});
    }
    function frame(ts){
      if(!confettiState || !confettiState.running) return;
      if(!lastSpawn) lastSpawn = ts;
      const elapsed = ts - lastSpawn;
      if(elapsed > 80){ spawn(); lastSpawn = ts; }
      ctx.clearRect(0,0,cvs.width,cvs.height);
      for(let i=hearts.length-1;i>=0;i--){
        const h = hearts[i];
        h.x += h.vx; h.y += h.vy; h.rot += 0.04; h.alpha -= 0.0008;
        if(h.y > cvs.height + 30 || h.alpha <= 0){ hearts.splice(i,1); continue; }
        ctx.save(); ctx.translate(h.x,h.y); ctx.rotate(Math.sin(h.rot)*0.3);
        ctx.fillStyle = `rgba(255,140,180,${h.alpha})`;
        ctx.beginPath(); ctx.moveTo(0, -h.size/2); ctx.bezierCurveTo(h.size,-h.size/2,h.size,h.size/3,0,h.size);
        ctx.bezierCurveTo(-h.size,h.size/3,-h.size,-h.size/2,0,-h.size/2); ctx.fill(); ctx.restore();
      }
      confettiRaf = requestAnimationFrame(frame);
    }
    confettiRaf = requestAnimationFrame(frame);
  }
  function stopConfetti(){ if(confettiRaf){ cancelAnimationFrame(confettiRaf); confettiRaf = null; } if(confettiState) confettiState.running=false; const cvs=document.getElementById('confetti'); const ctx=cvs&&cvs.getContext('2d'); if(ctx) ctx.clearRect(0,0,cvs.width,cvs.height); }

})();

// Password gate logic (runs after main IIFE)
(function(){
  const gate = document.getElementById('pwGate');
  if(!gate) return;
  const input = document.getElementById('pwInput');
  const btn = document.getElementById('pwSubmit');
  const music = document.getElementById('bgMusic');
  const musicToggle = document.getElementById('musicToggle');
  const page = document.getElementById('page');
  const accessExpiry = new Date(Date.UTC(2026, 8, 22, 0, 0, 0));
  const accessExpired = Date.now() >= accessExpiry.getTime();

  function hideGate(){
    gate.setAttribute('aria-hidden','true');
    gate.style.display = 'none';
    document.documentElement.style.overflow = '';
    if (page) page.style.display = 'block';
  }

  function showGate(){
    gate.setAttribute('aria-hidden','false');
    gate.style.display = 'flex';
    document.documentElement.style.overflow = 'hidden';
    if (page) page.style.display = 'block';
  }

  let storedOk = false;
  try {
    storedOk = sessionStorage.getItem('hb_unlocked') === '1';
  } catch (e) {
    storedOk = false;
  }

  // If the access window has expired, or it was already unlocked in this session, hide the gate.
  if(accessExpired || storedOk){
    hideGate();
  } else {
    // prevent scrolling while locked
    showGate();
  }

  function triggerUnlockBurst(){
    const burst = document.createElement('div');
    burst.className = 'unlock-burst';

    const particles = [
      { type: 'petal', symbol: '❀', count: 28 },
      { type: 'star', symbol: '✦', count: 26 },
      { type: 'heart', symbol: '❤', count: 20 }
    ];

    particles.forEach(({ type, symbol, count }) => {
      for (let i = 0; i < count; i++) {
        const p = document.createElement('span');
        p.className = `unlock-particle ${type}`;
        p.textContent = symbol;
        p.style.setProperty('--r', `${(Math.random() * 360) - 180}deg`);
        p.style.setProperty('--x', `${(Math.random() * 420 - 210).toFixed(2)}px`);
        p.style.setProperty('--y', `${(Math.random() * 420 - 210).toFixed(2)}px`);
        p.style.fontSize = `${(Math.random() * 18 + 18).toFixed(2)}px`;
        burst.appendChild(p);
      }
    });

    document.body.appendChild(burst);
    setTimeout(() => burst.remove(), 2600);
  }

  function unlockPage(){
    triggerUnlockBurst();

    if (music) {
      music.volume = 0.5;
      music.muted = false;
      music.play().then(() => {
        if (musicToggle) musicToggle.textContent = 'Pause Music';
      }).catch(() => {
        if (musicToggle) musicToggle.textContent = 'Play Music';
      });
    }

    try {
      sessionStorage.setItem('hb_unlocked','1');
    } catch (e) {
      // Ignore browser storage restrictions; the page can still open once expiry is reached.
    }
    gate.setAttribute('aria-hidden','true');
    gate.style.display = 'none';
    document.documentElement.style.overflow = '';
    if (page) page.style.display = 'block';
  }

  function check(){
    const pw = (input && input.value || '').trim();
    if(!pw) return;

    const expected = gate.dataset.password || '';
    const decodedExpected = (() => {
      try { return atob(expected); } catch { return ''; }
    })();

    try{
      const encoded = btoa(pw);
      const directMatch = pw === decodedExpected;
      const base64Match = encoded === expected;

      if(directMatch || base64Match){
        unlockPage();
      } else {
        gate.classList.remove('shake');
        void gate.offsetWidth;
        gate.classList.add('shake');
        if(input) input.value = '';
      }
    }catch(e){
      console.error(e);
    }
  }
  btn && btn.addEventListener('click', check);
  input && input.addEventListener('keydown', e=>{ if(e.key === 'Enter') check(); });
})();
