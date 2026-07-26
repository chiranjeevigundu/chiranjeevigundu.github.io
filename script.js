/* =========================================================
   Chiranjeevi Gundu — Portfolio interactions
   ========================================================= */
(function () {
    'use strict';

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
        const ctx = canvas.getContext('2d');
        let w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
        let particles = [];
        const pointer = { x: -9999, y: -9999 };

        // Mostly white dust with occasional subtle colour, echoing the source palette.
        const TINTS = [
            'rgba(255,255,255,',   // white
            'rgba(255,255,255,',
            'rgba(255,255,255,',
            'rgba(138,180,248,',   // soft blue
            'rgba(242,139,130,',   // soft red
            'rgba(129,201,149,'    // soft green
        ];

        function rand(min, max) { return min + Math.random() * (max - min); }

        function build() {
            const target = Math.round((w * h) / 14000); // density scales with viewport
            const count = Math.max(40, Math.min(180, target));
            particles = [];
            for (let i = 0; i < count; i++) {
                particles.push({
                    x: Math.random() * w,
                    y: Math.random() * h,
                    r: rand(0.5, 1.8),
                    vy: -rand(0.05, 0.35),           // drift upward (anti-gravity)
                    vx: rand(-0.12, 0.12),
                    a: rand(0.15, 0.75),
                    tw: rand(0.004, 0.02),           // twinkle speed
                    ph: Math.random() * Math.PI * 2,
                    tint: TINTS[(Math.random() * TINTS.length) | 0]
                });
            }
        }

        function resize() {
            w = canvas.clientWidth = window.innerWidth;
            h = canvas.clientHeight = window.innerHeight;
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = Math.floor(w * dpr);
            canvas.height = Math.floor(h * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            build();
        }

        function frame() {
            ctx.clearRect(0, 0, w, h);
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.ph += p.tw;

                // gentle repulsion from the pointer for a subtle interactive feel
                const dx = p.x - pointer.x, dy = p.y - pointer.y;
                const d2 = dx * dx + dy * dy;
                if (d2 < 14000) {
                    const f = (14000 - d2) / 14000 * 0.6;
                    const d = Math.sqrt(d2) || 1;
                    p.x += (dx / d) * f;
                    p.y += (dy / d) * f;
                }

                // wrap around edges
                if (p.y < -5) { p.y = h + 5; p.x = Math.random() * w; }
                if (p.x < -5) p.x = w + 5;
                else if (p.x > w + 5) p.x = -5;

                const alpha = p.a * (0.55 + 0.45 * Math.sin(p.ph));
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = p.tint + alpha.toFixed(3) + ')';
                ctx.fill();
            }
            requestAnimationFrame(frame);
        }

        window.addEventListener('resize', resize, { passive: true });
        window.addEventListener('pointermove', function (e) {
            pointer.x = e.clientX; pointer.y = e.clientY;
        }, { passive: true });
        window.addEventListener('pointerleave', function () {
            pointer.x = pointer.y = -9999;
        }, { passive: true });

        resize();
        if (reduce) {
            // Static field, no animation, for reduced-motion users.
            frameOnce();
        } else {
            requestAnimationFrame(frame);
        }

        function frameOnce() {
            ctx.clearRect(0, 0, w, h);
            particles.forEach(function (p) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = p.tint + p.a.toFixed(3) + ')';
                ctx.fill();
            });
        }
    })();
})();
