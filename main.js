/* Frontier Access — interactions */
(() => {
  const doc = document.documentElement;
  const body = document.body;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Page load ---------- */
  const markLoaded = () => requestAnimationFrame(() => body.classList.add('is-loaded'));
  if (document.fonts && document.fonts.ready) {
    Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 900))]).then(markLoaded);
  } else {
    window.addEventListener('load', markLoaded);
  }

  /* ---------- Year ---------- */
  document.querySelectorAll('[data-year]').forEach(el => (el.textContent = new Date().getFullYear()));

  /* ---------- Split headings into words ---------- */
  document.querySelectorAll('[data-split]').forEach(el => {
    const words = el.textContent.trim().split(/\s+/);
    el.setAttribute('aria-label', el.textContent.trim());
    el.innerHTML = words
      .map((w, i) => `<span class="split-word" aria-hidden="true"><span style="--i:${i}">${w}</span></span>`)
      .join(' ');
  });

  /* ---------- Reveal on scroll ---------- */
  const revealTargets = document.querySelectorAll('[data-reveal], [data-split], .footer-giant');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      }),
      { rootMargin: '0px 0px -10% 0px', threshold: 0.05 }
    );
    revealTargets.forEach(el => io.observe(el));
  } else {
    revealTargets.forEach(el => el.classList.add('in'));
  }

  /* ---------- Counters ---------- */
  const counters = document.querySelectorAll('[data-count]');
  const fmt = n => n.toLocaleString('en-US');
  const runCounter = el => {
    const target = +el.dataset.count;
    if (reduceMotion) { el.textContent = fmt(target); return; }
    const dur = 1800, start = performance.now();
    const tick = now => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 4);
      el.textContent = fmt(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if ('IntersectionObserver' in window) {
    const cio = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { runCounter(e.target); cio.unobserve(e.target); }
    }), { threshold: 0.6 });
    counters.forEach(c => cio.observe(c));
  } else counters.forEach(runCounter);

  /* ---------- Marquee: duplicate group for seamless loop ---------- */
  document.querySelectorAll('[data-marquee] .marquee-track').forEach(track => {
    const group = track.querySelector('.marquee-group');
    const clone = group.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
  });

  /* ---------- What we do: expandable rows (hover on desktop, tap/keyboard everywhere) ---------- */
  const canHover = window.matchMedia('(hover: hover)');
  document.querySelectorAll('[data-expand]').forEach(row => {
    const toggleRow = () => {
      const open = !row.classList.contains('is-open');
      row.classList.toggle('is-open', open);
      row.setAttribute('aria-expanded', String(open));
    };
    // Mouse users get hover; touch screens (no hover) tap to open and close.
    row.addEventListener('click', () => { if (!canHover.matches) toggleRow(); });
    row.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleRow(); }
    });
  });

  /* ---------- Newsletter ---------- */
  const newsletter = document.querySelector('[data-newsletter]');
  if (newsletter) {
    const input = newsletter.querySelector('input[type="email"]');
    const status = newsletter.querySelector('.newsletter-status');
    const say = (msg, isError) => {
      status.textContent = msg;
      status.classList.toggle('is-error', !!isError);
    };
    newsletter.addEventListener('submit', e => {
      const email = input.value.trim();
      if (!email || !input.checkValidity()) {
        e.preventDefault();
        say('Please enter a valid email address.', true);
        input.focus();
        return;
      }
      // A mailing-list service URL in the form's action takes over from here.
      if (newsletter.getAttribute('action')) return;
      e.preventDefault();
      const subject = encodeURIComponent('Newsletter subscription');
      const body = encodeURIComponent(`Please add ${email} to the Frontier Access newsletter.`);
      window.location.href = `mailto:info@frontieraccess.org?subject=${subject}&body=${body}`;
      say('Thanks! Your email app will open so you can send your subscription request.');
      newsletter.reset();
    });
    input.addEventListener('input', () => { if (status.classList.contains('is-error')) say(''); });
  }

  /* ---------- Mobile menu ---------- */
  const toggle = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-mobile-menu]');
  const setMenu = open => {
    body.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.setAttribute('aria-hidden', String(!open));
  };
  toggle.addEventListener('click', () => setMenu(!body.classList.contains('menu-open')));
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  window.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
  window.addEventListener('resize', () => { if (window.innerWidth > 1180) setMenu(false); });

  /* ---------- Active nav link ---------- */
  const navLinks = [...document.querySelectorAll('.main-nav a')];
  const navMap = new Map(navLinks.map(a => [a.getAttribute('href').slice(1), a]));
  const sectionIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      navLinks.forEach(a => a.classList.remove('is-active'));
      const link = navMap.get(e.target.id);
      if (link) link.classList.add('is-active');
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  ['top', 'what-we-do', 'contact'].forEach(id => {
    const el = document.getElementById(id);
    if (el) sectionIO.observe(el);
  });

  /* ---------- Scroll-driven: header, progress, steps ---------- */
  const header = document.querySelector('[data-header]');
  const progress = document.querySelector('.scroll-progress span');
  const steps = [...document.querySelectorAll('[data-step]')];
  const stepCurrent = document.querySelector('[data-step-current]');
  const stepBar = document.querySelector('[data-step-bar]');
  const stepsWrap = document.querySelector('[data-steps]');
  let lastY = window.scrollY;
  let ticking = false;

  const onScroll = () => {
    const y = window.scrollY;
    const vh = window.innerHeight;
    const max = doc.scrollHeight - vh;

    // Header state
    header.classList.toggle('is-scrolled', y > 40);
    if (!body.classList.contains('menu-open')) {
      header.classList.toggle('is-hidden', y > lastY && y > vh * 0.8);
    }
    lastY = y;

    // Progress bar
    if (progress) progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;


    // Steps
    if (steps.length) {
      let active = 0;
      steps.forEach((s, i) => {
        const r = s.getBoundingClientRect();
        if (r.top < vh * 0.6) active = i;
      });
      steps.forEach((s, i) => s.classList.toggle('is-active', i === active));
      if (stepCurrent) stepCurrent.textContent = String(active + 1).padStart(2, '0');
      if (stepBar && stepsWrap) {
        const r = stepsWrap.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, (vh * 0.6 - r.top) / r.height));
        stepBar.style.transform = `scaleX(${p})`;
      }
    }
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---------- Hero canvas: flowing "frontier" contour lines ---------- */
  const canvas = document.querySelector('[data-hero-canvas]');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let w = 0, h = 0, dpr = 1, raf = 0, visible = true;
    const mouse = { x: 0.7, y: 0.45, tx: 0.7, ty: 0.45 };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = t => {
      ctx.clearRect(0, 0, w, h);
      mouse.x += (mouse.tx - mouse.x) * 0.04;
      mouse.y += (mouse.ty - mouse.y) * 0.04;

      const lines = w < 700 ? 26 : 42;
      const top = h * 0.08, span = h * 0.9;
      const step = w < 700 ? 10 : 7;
      const time = t * 0.00022;

      for (let i = 0; i < lines; i++) {
        const li = i / (lines - 1);
        const baseY = top + li * span;
        const accent = i % 9 === 4;
        ctx.beginPath();
        for (let x = -10; x <= w + 10; x += step) {
          const nx = x / w;
          // a soft "ridge" centred near the pointer, pushing lines upward
          const dx = nx - mouse.x, dy = li - mouse.y;
          const ridge = Math.exp(-(dx * dx) / 0.05 - (dy * dy) / 0.22);
          const wave =
            Math.sin(nx * 4.2 + time * 3 + li * 2.4) * 14 +
            Math.sin(nx * 9.5 - time * 2 + li * 5.1) * 6 +
            Math.cos(nx * 2.1 + time + li * 1.3) * 10;
          const y = baseY + wave * (0.4 + li) - ridge * h * 0.16;
          x === -10 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        const alpha = 0.05 + li * 0.13;
        ctx.strokeStyle = accent ? `rgba(227,172,46,${alpha + 0.12})` : `rgba(150,196,226,${alpha})`;
        ctx.lineWidth = accent ? 1.2 : 0.8;
        ctx.stroke();
      }
    };

    const loop = t => {
      draw(t);
      if (visible) raf = requestAnimationFrame(loop);
    };

    resize();
    window.addEventListener('resize', resize);
    if (reduceMotion) {
      draw(0);
    } else {
      raf = requestAnimationFrame(loop);
      const hero = canvas.parentElement;
      hero.addEventListener('pointermove', e => {
        const r = hero.getBoundingClientRect();
        mouse.tx = (e.clientX - r.left) / r.width;
        mouse.ty = (e.clientY - r.top) / r.height;
      });
      hero.addEventListener('pointerleave', () => { mouse.tx = 0.7; mouse.ty = 0.45; });
      new IntersectionObserver(([e]) => {
        visible = e.isIntersecting;
        cancelAnimationFrame(raf);
        if (visible) raf = requestAnimationFrame(loop);
      }).observe(hero);
    }
  }
})();
