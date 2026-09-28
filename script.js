(() => {
  'use strict';

  if (window.lucide) lucide.createIcons();
  document.getElementById('year').textContent = new Date().getFullYear();

  const topbar = document.getElementById('topbar');
  const backTop = document.getElementById('backTop');
  const onScroll = () => {
    topbar.classList.toggle('scrolled', window.scrollY > 24);
    backTop.classList.toggle('show', window.scrollY > 620);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // Keep the page visually fixed while the menu is open without changing the current scroll position.
  const mobileMenu = document.getElementById('mobileMenu');
  const menuOpen = document.getElementById('menuOpen');
  const menuClose = document.getElementById('menuClose');

  function openMenu() {
    document.documentElement.classList.add('menu-locked');
    document.body.classList.add('menu-locked');
    mobileMenu.classList.add('open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    menuOpen.setAttribute('aria-expanded', 'true');
  }

  function closeMenu() {
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    menuOpen.setAttribute('aria-expanded', 'false');
    document.documentElement.classList.remove('menu-locked');
    document.body.classList.remove('menu-locked');
  }

  menuOpen.addEventListener('click', openMenu);
  menuClose.addEventListener('click', () => closeMenu());
  mobileMenu.addEventListener('click', e => { if (e.target === mobileMenu) closeMenu(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && mobileMenu.classList.contains('open')) closeMenu(); });

  mobileMenu.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      closeMenu();
      requestAnimationFrame(() => target?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    });
  });

  // Intersection reveal.
  const reveals = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px' });
  reveals.forEach(el => io.observe(el));

  // Native scroll-snap carousels + buttons. Native touch handles vertical/horizontal intent better than custom gesture hijacking.
  function carouselStep(track, direction) {
    const first = track.querySelector(':scope > *');
    if (!first) return;
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    const step = first.getBoundingClientRect().width + gap;
    track.scrollBy({ left: step * direction, behavior: 'smooth' });
  }

  document.querySelectorAll('[data-carousel-next]').forEach(btn => {
    btn.addEventListener('click', () => carouselStep(document.getElementById(btn.dataset.carouselNext), 1));
  });
  document.querySelectorAll('[data-carousel-prev]').forEach(btn => {
    btn.addEventListener('click', () => carouselStep(document.getElementById(btn.dataset.carouselPrev), -1));
  });

  const foodTrack = document.getElementById('foodTrack');
  const foodProgress = document.getElementById('foodProgress');
  const updateFoodProgress = () => {
    const max = foodTrack.scrollWidth - foodTrack.clientWidth;
    const pct = max <= 0 ? 100 : 20 + (foodTrack.scrollLeft / max) * 80;
    foodProgress.style.width = `${Math.max(20, Math.min(100, pct))}%`;
  };
  foodTrack.addEventListener('scroll', updateFoodProgress, { passive: true });
  window.addEventListener('resize', updateFoodProgress);
  updateFoodProgress();

  const reviewTrack = document.getElementById('reviewTrack');
  const reviewDots = document.getElementById('reviewDots');
  const reviewCards = [...reviewTrack.children];
  reviewCards.forEach((_, i) => {
    const dot = document.createElement('span');
    if (i === 0) dot.classList.add('active');
    reviewDots.appendChild(dot);
  });
  const dots = [...reviewDots.children];
  const updateReviewDots = () => {
    const card = reviewCards[0];
    if (!card) return;
    const gap = parseFloat(getComputedStyle(reviewTrack).gap) || 0;
    const step = card.getBoundingClientRect().width + gap;
    const index = Math.max(0, Math.min(reviewCards.length - 1, Math.round(reviewTrack.scrollLeft / step)));
    dots.forEach((d, i) => d.classList.toggle('active', i === index));
  };
  reviewTrack.addEventListener('scroll', updateReviewDots, { passive: true });

  // Keyboard support on horizontal tracks.
  [foodTrack, reviewTrack].forEach(track => {
    track.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { e.preventDefault(); carouselStep(track, 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); carouselStep(track, -1); }
    });
  });

  // Subtle parallax on capable devices only.
  const parallaxEls = [...document.querySelectorAll('.parallax')];
  let ticking = false;
  const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function updateParallax() {
    if (!prefersReduced && innerWidth > 780) {
      parallaxEls.forEach(el => {
        const rect = el.parentElement.getBoundingClientRect();
        const speed = parseFloat(el.dataset.speed || '0.08');
        const y = Math.max(-70, Math.min(70, -rect.top * speed));
        el.style.transform = `scale(1.06) translate3d(0, ${y}px, 0)`;
      });
    }
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(updateParallax); ticking = true; }
  }, { passive: true });
  updateParallax();

  // Lightweight 3D tilt. Disabled on touch and reduced motion.
  if (matchMedia('(hover:hover) and (pointer:fine)').matches && !prefersReduced) {
    document.querySelectorAll('.tilt-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5;
        const y = (e.clientY - r.top) / r.height - .5;
        card.style.transform = `perspective(900px) rotateX(${(-y * 3.4).toFixed(2)}deg) rotateY(${(x * 4.2).toFixed(2)}deg) translateZ(0)`;
      });
      card.addEventListener('mouseleave', () => card.style.transform = '');
    });
  }
})();
