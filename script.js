/* =========================================================
   Chiranjeevi Gundu — Portfolio interactions
   ========================================================= */
(function () {
    'use strict';

    // Idempotency guard: if this script is evaluated more than once in the same
    // page (hot-reload / live-preview / bfcache re-entry), bail out so we never
    // start a second typewriter or particle loop — that caused the text to jump
    // around erratically as two loops fought over the same element.
    if (window.__cgPortfolioInit) return;
    window.__cgPortfolioInit = true;

    /* ---------- Mobile menu ---------- */
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', function () {
            const open = navLinks.classList.toggle('open');
            menuToggle.setAttribute('aria-expanded', String(open));
            menuToggle.querySelector('i').className = open ? 'fas fa-xmark' : 'fas fa-bars';
        });

        navLinks.addEventListener('click', function (e) {
            if (e.target.tagName === 'A') {
                navLinks.classList.remove('open');
                menuToggle.setAttribute('aria-expanded', 'false');
                menuToggle.querySelector('i').className = 'fas fa-bars';
            }
        });
    }

    /* ---------- Typewriter ---------- */
    const typeEl = document.getElementById('typewriter');
    const lines = [
        'building multi-agent systems that ship to production',
        'RAG pipelines grounded in real documents, with citations',
        'typed APIs, tested, containerized, deployed on AWS & Azure',
        'privacy-first: open models running on client infrastructure'
    ];

    if (typeEl) {
        let lineIdx = 0, charIdx = 0, deleting = false;

        (function tick() {
            const line = lines[lineIdx];

            if (!deleting) {
                typeEl.textContent = line.slice(0, ++charIdx);
                if (charIdx === line.length) {
                    deleting = true;
                    return setTimeout(tick, 2200);
                }
                return setTimeout(tick, 38);
            }

            typeEl.textContent = line.slice(0, --charIdx);
            if (charIdx === 0) {
                deleting = false;
                lineIdx = (lineIdx + 1) % lines.length;
                return setTimeout(tick, 400);
            }
            return setTimeout(tick, 18);
        })();
    }

    /* ---------- Scroll: nav state, progress bar, scroll spy ---------- */
    const nav = document.getElementById('navbar');
    const progress = document.getElementById('scrollProgress');
    const sections = Array.prototype.slice.call(
        document.querySelectorAll('header[id], section[id]')
    );
    const linkFor = {};
    document.querySelectorAll('.nav-links a').forEach(function (a) {
        linkFor[a.getAttribute('href').slice(1)] = a;
    });

    let ticking = false;

    function onScroll() {
        const y = window.scrollY;

        if (nav) nav.classList.toggle('scrolled', y > 24);

        if (progress) {
            const max = document.documentElement.scrollHeight - window.innerHeight;
            progress.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
        }

        let active = sections[0];
        sections.forEach(function (s) {
            if (s.offsetTop - 140 <= y) active = s;
        });
        if (active) {
            Object.keys(linkFor).forEach(function (id) {
                linkFor[id].classList.toggle('active', id === active.id);
            });
        }

        ticking = false;
    }

    window.addEventListener('scroll', function () {
        if (!ticking) {
            window.requestAnimationFrame(onScroll);
            ticking = true;
        }
    }, { passive: true });
    onScroll();

    /* ---------- Reveal on scroll ---------- */
    const revealEls = document.querySelectorAll('.reveal');

    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        revealEls.forEach(function (el) { io.observe(el); });
    } else {
        revealEls.forEach(function (el) { el.classList.add('visible'); });
    }

    /* ---------- Animated metric counters ---------- */
    const counters = document.querySelectorAll('.metric-num');

    function animateCount(el) {
        const target = parseInt(el.dataset.count, 10);
        const suffix = el.dataset.suffix || '';
        const duration = 1100;
        const start = performance.now();

        (function step(now) {
            const t = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - t, 3);
            el.textContent = Math.round(target * eased) + suffix;
            if (t < 1) requestAnimationFrame(step);
        })(start);
    }

    if ('IntersectionObserver' in window && counters.length) {
        const co = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    animateCount(entry.target);
                    co.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        counters.forEach(function (el) { co.observe(el); });
    } else {
        counters.forEach(function (el) {
            el.textContent = el.dataset.count + (el.dataset.suffix || '');
        });
    }

    /* ---------- Show more / less ---------- */
    document.querySelectorAll('.more-toggle').forEach(function (btn) {
        btn.addEventListener('click', function () {
            const panel = btn.parentElement.querySelector('.more');
            if (!panel) return;
            const expanded = btn.getAttribute('aria-expanded') === 'true';
            panel.hidden = expanded;
            btn.setAttribute('aria-expanded', String(!expanded));
            btn.firstChild.nodeValue = expanded ? 'Show more ' : 'Show less ';
        });
    });

    /* ---------- Footer year ---------- */
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /* ---------- Antigravity particle field ---------- */
    (function particleField() {
        const canvas = document.getElementById('particleField');
        if (!canvas) return;
        const reduce = window.matchMedia &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const coarse = window.matchMedia &&
            window.matchMedia('(pointer: coarse)').matches; // touch: skip pointer interaction
        const ctx = canvas.getContext('2d');
        let w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
        let particles = [];
        let running = false, lastT = 0;
        const pointer = { x: -9999, y: -9999, active: false };
        const REPEL_R = 130, REPEL_R2 = REPEL_R * REPEL_R;

        // Solid colours (opacity applied per-frame via globalAlpha — no per-frame string alloc).
        // Mostly white dust with occasional subtle colour, echoing the source palette.
        const TINTS = [
            'rgb(255,255,255)', 'rgb(255,255,255)', 'rgb(255,255,255)', 'rgb(255,255,255)',
            'rgb(138,180,248)', // soft blue
            'rgb(242,139,130)', // soft red
            'rgb(129,201,149)'  // soft green
        ];

        function rand(min, max) { return min + Math.random() * (max - min); }

        function build() {
            // Density scales with viewport but is capped tighter on small / touch screens.
            const cap = (coarse || w < 640) ? 55 : 150;
            const count = Math.max(28, Math.min(cap, Math.round((w * h) / 12000)));
            particles = [];
            for (let i = 0; i < count; i++) {
                const z = Math.random();                 // depth 0 (far) → 1 (near)
                particles.push({
                    x: Math.random() * w,
                    y: Math.random() * h,
                    z: z,
                    r: 0.6 + z * 1.9,                    // near particles are larger
                    vy: -(0.10 + z * 0.42),              // …and drift upward faster (parallax)
                    sway: 0.15 + z * 0.5,                // horizontal weave amplitude
                    swayF: rand(0.006, 0.018),           // weave frequency
                    baseA: 0.10 + z * 0.5,               // near particles are brighter
                    tw: rand(0.004, 0.016),              // twinkle speed
                    ph: Math.random() * Math.PI * 2,
                    color: TINTS[(Math.random() * TINTS.length) | 0]
                });
            }
        }

        function resize() {
            w = window.innerWidth;
            h = window.innerHeight;
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = Math.floor(w * dpr);
            canvas.height = Math.floor(h * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            build();
        }

        function frame(now) {
            if (!running) return;
            // Frame-rate independent: dt in 60fps-units, clamped so a background tab
            // returning doesn't teleport particles.
            let dt = lastT ? (now - lastT) / 16.667 : 1;
            lastT = now;
            if (dt > 3) dt = 3;

            ctx.clearRect(0, 0, w, h);
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                p.ph += p.tw * dt;
                p.y += p.vy * dt;
                p.x += Math.sin(p.ph) * p.sway * dt;     // organic side-to-side weave

                // gentle pointer repulsion (skipped on touch devices)
                if (pointer.active) {
                    const dx = p.x - pointer.x, dy = p.y - pointer.y;
                    const d2 = dx * dx + dy * dy;
                    if (d2 < REPEL_R2 && d2 > 0.01) {
                        const d = Math.sqrt(d2);
                        const f = (1 - d / REPEL_R) * 1.6 * dt * (0.5 + p.z);
                        p.x += (dx / d) * f;
                        p.y += (dy / d) * f;
                    }
                }

                // wrap around edges
                if (p.y < -6) { p.y = h + 6; p.x = Math.random() * w; }
                if (p.x < -6) p.x = w + 6;
                else if (p.x > w + 6) p.x = -6;

                ctx.globalAlpha = p.baseA * (0.6 + 0.4 * Math.sin(p.ph));
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;
            requestAnimationFrame(frame);
        }

        function start() {
            if (running || reduce) return;
            running = true; lastT = 0;
            requestAnimationFrame(frame);
        }
        function stop() { running = false; }

        function drawStatic() {
            ctx.clearRect(0, 0, w, h);
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                ctx.globalAlpha = p.baseA;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;
        }

        window.addEventListener('resize', function () {
            resize();
            if (reduce) drawStatic();
        }, { passive: true });

        if (!coarse) {
            window.addEventListener('pointermove', function (e) {
                pointer.x = e.clientX; pointer.y = e.clientY; pointer.active = true;
            }, { passive: true });
            window.addEventListener('pointerleave', function () {
                pointer.active = false;
            }, { passive: true });
        }

        // Pause the loop when the tab is hidden to save CPU/battery.
        document.addEventListener('visibilitychange', function () {
            if (document.hidden) stop();
            else start();
        });

        resize();
        if (reduce) drawStatic();
        else start();
    })();
})();
