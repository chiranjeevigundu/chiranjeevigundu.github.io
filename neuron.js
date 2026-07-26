/* =========================================================
   Chiranjeevi's Neuron — a roaming mini-assistant.
   Self-contained: a curated knowledge base matched in-browser.
   No API key, no backend. Answers only from published portfolio content.
   ========================================================= */
(function () {
    'use strict';
    if (window.__cgNeuronInit) return;      // idempotency guard (hot-reload / bfcache)
    window.__cgNeuronInit = true;

    const neuron = document.getElementById('neuron');
    const greetEl = document.getElementById('neuronGreet');
    const chat = document.getElementById('neuronChat');
    const logEl = document.getElementById('neuronLog');
    const form = document.getElementById('neuronForm');
    const input = document.getElementById('neuronInput');
    const closeBtn = document.getElementById('neuronClose');
    const suggestEl = document.getElementById('neuronSuggest');
    if (!neuron || !chat || !logEl || !form || !input) return;

    const reduce = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------------- Knowledge base ---------------- */
    const MAIL = "chiranjeevigundu1@gmail.com";
    const FALLBACK =
        "I'm just a single neuron 🧠, so I stick to Chiranjeevi's work — try asking about his " +
        "<b>experience</b>, <b>Aadyon Assist</b>, <b>tech stack</b>, <b>RAG / agents</b>, or " +
        "<b>how to reach him</b>. For anything else, email " +
        "<a href='mailto:" + MAIL + "'>" + MAIL + "</a>.";

    const KB = [
        { k: ['hi', 'hello', 'hey', 'yo', 'greetings', 'howdy', 'hiya', 'namaste', 'good morning', 'good evening'],
          r: "Hey there 👋 I'm a single neuron on loan from Chiranjeevi's brain. Ask me about his experience, the Aadyon Assist project, his tech stack, how he builds RAG / agents, or how to reach him." },

        { k: ['who are you', 'are you real', 'are you ai', 'are you a bot', 'chatgpt', 'real ai', 'robot', 'what are you', 'are you human', 'llm'],
          r: "Ha — I'm not a big fancy LLM, just a tiny scripted neuron wired up from Chiranjeevi's portfolio, matching your question to what he's published here. For a real conversation, email him at <a href='mailto:" + MAIL + "'>" + MAIL + "</a> 🙂" },

        { k: ['who is', 'about him', 'about chiranjeevi', 'tell me about', 'introduce', 'summary', 'overview', 'profile', 'bio', 'chiranjeevi'],
          r: "Chiranjeevi Gundu is an <b>AI Engineer &amp; Systems Architect</b> in Tempe, AZ — M.S. in Computer Science (AI track) and ~4 years taking AI from prototype to production. He designs end-to-end GenAI systems (multi-agent orchestration, RAG, model routing) and ships them with backend rigor. Open to AI Engineering roles." },

        { k: ['current', 'currently', 'right now', 'these days', 'present role', 'latest role', 'where does he work', 'where is he working', 'axitem'],
          r: "Right now he's an <b>AI Engineer at Axitem Software Solution</b> (remote, US · Aug 2025–present): building RAG pipelines and document-Q&amp;A chatbots in Python / LangChain / OpenAI, grounding answers with citations, and running open-source models (Llama 3, Mistral) on client infrastructure for privacy-sensitive deals." },

        { k: ['experience', 'work history', 'worked', 'career', 'jobs', 'employment', 'sodexo', 'tcs', 'tata', 'past role', 'previous'],
          r: "4 years across three roles: <b>AI Engineer @ Axitem</b> (2025–now) — RAG document-Q&amp;A, +35% retrieval accuracy, private on-prem LLMs; <b>Systems Automation Engineer @ Sodexo</b> — saved 10+ hrs/week, cut kiosk downtime 15%; <b>Backend Engineer @ TCS</b> — cut ticket-sorting 40%, sped a critical workflow 60%. Want detail on any one?" },

        { k: ['project', 'aadyon', 'built', 'side project', 'open source', 'open-source', 'repo', 'github project', 'portfolio piece'],
          r: "<b>Aadyon Assist</b> — an open-source (MIT) self-hosted AI life-ops platform he built solo: 7 Docker microservices on FastAPI + Postgres 16/pgvector, a CEO agent delegating to 4 specialist agent teams, human-in-the-loop approval for any real-world action, tiered model routing over LiteLLM, multi-tenant Row-Level Security, 149 tests. Repo: <a href='https://github.com/chiranjeevigundu/aadyon-assist' target='_blank' rel='noopener'>github.com/chiranjeevigundu/aadyon-assist</a>" },

        { k: ['rag', 'retrieval', 'vector', 'embedding', 'chunk', 'semantic search', 'pinecone', 'pgvector', 'citation', 'grounding'],
          r: "His RAG approach: structure-aware parsing → tuned chunking → embeddings → vector store (Pinecone / pgvector) → retrieve top-k → grounded generation <i>with citations</i> and a refusal path when confidence is low. He proves accuracy with a fixed eval set, separating retrieval failures from generation failures — that loop drove a ~<b>35%</b> accuracy gain." },

        { k: ['agent', 'langgraph', 'orchestrat', 'multi-agent', 'autonomous', 'tool-calling', 'tool calling', 'workflow'],
          r: "He designs agents as explicit <b>state machines</b> (LangGraph), not open-ended loops: bounded step counts, a verify step, and a human approval gate before anything with a side effect. In Aadyon, a CEO agent decomposes a goal and delegates to 4 specialist teams, every step written to an audit trail." },

        { k: ['model routing', 'openai', 'anthropic', 'claude', 'llama', 'mistral', 'gpt', 'local model', 'cost', 'privacy', 'ollama', 'litellm', 'which model'],
          r: "He keeps pipelines <b>model-agnostic</b> with tiered routing over LiteLLM — cheap models for extraction, strong models for hard reasoning, local Llama 3 (via Ollama) for private/bulk work — all driven by a config table, no code changes. That's how he unlocked privacy-sensitive deals: client data never leaves their infrastructure." },

        { k: ['backend', 'api', 'fastapi', 'postgres', 'database', 'sql', 'microservice', 'docker', 'infrastructure', 'performance'],
          r: "Backend is his foundation: typed <b>FastAPI</b> services, <b>PostgreSQL</b> (RLS multi-tenancy, indexing, EXPLAIN ANALYZE profiling), Docker, health endpoints, structured logging, CI/CD with PyTest. At TCS he sped a mission-critical workflow <b>60%</b> via query optimization." },

        { k: ['skill', 'stack', 'tech', 'technolog', 'tools', 'languages', 'proficient', 'expertise', 'what can he do', 'good at'],
          r: "Core stack: Python, RAG, LangChain / LangGraph, agent orchestration, OpenAI / Anthropic / Llama, FastAPI, PostgreSQL / pgvector, Pinecone, Docker, AWS &amp; Azure, CI/CD. He's strongest where AI meets solid backend. The <b>Tech Stack</b> section on this page has the full list." },

        { k: ['education', 'degree', 'study', 'studied', 'university', 'master', 'school', 'college', 'academic', 'jntu', 'btech', 'saint louis'],
          r: "<b>M.S. Computer Science — AI Track</b>, Saint Louis University (2023–2025). <b>B.Tech, Electronics &amp; Communication Engineering</b>, JNTU, India (2017–2021)." },

        { k: ['metric', 'impact', 'result', 'numbers', 'achievement', 'accuracy', 'improvement', 'outcome'],
          r: "Numbers he's shipped: <b>+35%</b> retrieval accuracy · <b>40%</b> less manual ticket-sorting · <b>60%</b> faster critical workflow · <b>10+ hrs/week</b> saved via automation · <b>85%+</b> test coverage." },

        { k: ['location', 'where is he', 'based', 'tempe', 'relocat', 'remote', 'onsite', 'timezone', 'arizona'],
          r: "He's based in <b>Tempe, AZ</b> and works remotely (his Axitem role is remote, US). Open to AI Engineering roles." },

        { k: ['resume', 'cv', 'download'],
          r: "Here's his resume: <a href='Chiranjeevi_Gundu_AI_Engineer.pdf' download>Download PDF</a>. TL;DR — AI Engineer, ~4 yrs, RAG + agents + production backend." },

        { k: ['contact', 'email', 'reach', 'hire', 'hiring', 'available', 'availability', 'open to', 'opportunit', 'recruiter', 'linkedin', 'phone', 'connect', 'get in touch', 'role'],
          r: "He's open to AI Engineering roles. Reach him at <a href='mailto:" + MAIL + "'>" + MAIL + "</a>, <a href='https://linkedin.com/in/chiranjeevigundu' target='_blank' rel='noopener'>LinkedIn</a>, or <a href='https://github.com/chiranjeevigundu' target='_blank' rel='noopener'>GitHub</a>. You can also grab his <a href='Chiranjeevi_Gundu_AI_Engineer.pdf' download>resume</a>." },

        { k: ['thank', 'thanks', 'thx', 'appreciate', 'cheers'],
          r: "Anytime! ⚡ If you're hiring or building something with agents / RAG, Chiranjeevi would love to hear from you — <a href='mailto:" + MAIL + "'>" + MAIL + "</a>." },

        { k: ['what can you do', 'help', 'options', 'what should i ask', 'capabilities', 'menu'],
          r: "I can tell you about Chiranjeevi's <b>experience</b>, the <b>Aadyon Assist</b> project, his <b>tech stack</b>, how he builds <b>RAG</b> and <b>agent</b> systems, his <b>education</b>, and how to <b>hire</b> him. What are you curious about?" }
    ];

    // Precompile matchers: multi-word keyword → substring; single word → word-start.
    KB.forEach(function (item) {
        item.m = item.k.map(function (kw) {
            if (kw.indexOf(' ') >= 0) return { multi: true, s: kw };
            return { multi: false, re: new RegExp('\\b' + kw) };
        });
    });

    function norm(s) {
        return ' ' + s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim() + ' ';
    }
    function respond(q) {
        const t = norm(q);
        let best = null, bestScore = 0;
        for (const item of KB) {
            let score = 0;
            for (let i = 0; i < item.m.length; i++) {
                const m = item.m[i];
                const hit = m.multi ? (t.indexOf(m.s) >= 0) : m.re.test(t);
                if (hit) score += (item.k[i].length > 4 ? 2 : 1);
            }
            if (score > bestScore) { bestScore = score; best = item; }
        }
        return bestScore > 0 ? best.r : FALLBACK;
    }

    /* ---------------- Chat UI ---------------- */
    const SUGGEST = [
        { label: 'Experience', q: 'Tell me about his experience' },
        { label: 'Aadyon Assist', q: 'Tell me about the Aadyon Assist project' },
        { label: 'Tech stack', q: 'What is his tech stack' },
        { label: 'How he does RAG', q: 'How does he build RAG' },
        { label: 'Hire / contact', q: 'How can I contact or hire him' }
    ];
    let chatOpen = false, greeted = false;

    function addMsg(html, who) {
        const el = document.createElement('div');
        el.className = 'nc-msg ' + who;
        if (who === 'user') el.textContent = html;   // visitor input → text only (no HTML injection)
        else el.innerHTML = html;                     // bot content is trusted, may contain links
        logEl.appendChild(el);
        logEl.scrollTop = logEl.scrollHeight;
        return el;
    }
    function botSay(html, delay) {
        const typing = addMsg('<span class="nc-typing"><i></i><i></i><i></i></span>', 'bot');
        setTimeout(function () {
            typing.innerHTML = html;
            logEl.scrollTop = logEl.scrollHeight;
        }, reduce ? 0 : (delay || 420));
    }
    function renderSuggest() {
        suggestEl.innerHTML = '';
        SUGGEST.forEach(function (s) {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'nc-chip';
            b.textContent = s.label;
            b.addEventListener('click', function () { ask(s.q); });
            suggestEl.appendChild(b);
        });
    }
    function ask(q) {
        addMsg(q, 'user');
        botSay(respond(q));
    }

    function openChat() {
        if (chatOpen) return;
        chatOpen = true;
        hideGreet();
        chat.classList.add('open');
        chat.setAttribute('aria-hidden', 'false');
        neuron.classList.add('docked');
        if (!greeted) {
            greeted = true;
            botSay("Hi! I'm a neuron from Chiranjeevi's brain 🧠⚡ Ask me anything about his work — or tap a topic below.", 250);
            renderSuggest();
        }
        setTimeout(function () { input.focus(); }, 250);
    }
    function closeChat() {
        chatOpen = false;
        chat.classList.remove('open');
        chat.setAttribute('aria-hidden', 'true');
        neuron.classList.remove('docked');
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const q = input.value.trim();
        if (!q) return;
        input.value = '';
        ask(q);
    });
    closeBtn.addEventListener('click', closeChat);
    neuron.addEventListener('click', function () { chatOpen ? closeChat() : openChat(); });
    neuron.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); chatOpen ? closeChat() : openChat(); }
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && chatOpen) closeChat(); });

    /* ---------------- Greeting bubble ---------------- */
    function showGreet() { if (!chatOpen) greetEl.classList.add('show'); }
    function hideGreet() { greetEl.classList.remove('show'); }
    neuron.addEventListener('mouseenter', showGreet);
    neuron.addEventListener('mouseleave', function () { if (!chatOpen) hideGreet(); });
    setTimeout(function () { showGreet(); setTimeout(hideGreet, 5200); }, 2600); // one-time intro

    /* ---------------- Roaming ---------------- */
    const SIZE = 62, MARGIN = 14, TOP = 84; // stay clear of the nav
    let x = window.innerWidth - SIZE - 28;
    let y = window.innerHeight - SIZE - 28;
    let vx = -0.35, vy = -0.28, running = true, lastT = 0, wobble = Math.random() * 6.28;

    function place() { neuron.style.transform = 'translate(' + x + 'px,' + y + 'px)'; }
    place();

    function roam(now) {
        if (!running) return;
        let dt = lastT ? (now - lastT) / 16.667 : 1;
        lastT = now;
        if (dt > 3) dt = 3;

        if (!chatOpen) {
            wobble += 0.008 * dt;
            vx += Math.cos(wobble) * 0.006 * dt;   // gentle wander
            vy += Math.sin(wobble * 1.3) * 0.006 * dt;
            // clamp speed
            const sp = Math.hypot(vx, vy), max = 0.55;
            if (sp > max) { vx = vx / sp * max; vy = vy / sp * max; }
            x += vx * dt; y += vy * dt;

            const maxX = window.innerWidth - SIZE - MARGIN, maxY = window.innerHeight - SIZE - MARGIN;
            if (x < MARGIN) { x = MARGIN; vx = Math.abs(vx); }
            else if (x > maxX) { x = maxX; vx = -Math.abs(vx); }
            if (y < TOP) { y = TOP; vy = Math.abs(vy); }
            else if (y > maxY) { y = maxY; vy = -Math.abs(vy); }
            place();
        }
        requestAnimationFrame(roam);
    }
    function startRoam() { if (running || reduce) return; running = true; lastT = 0; requestAnimationFrame(roam); }
    function stopRoam() { running = false; }

    // Pause roaming on hover so it's easy to click.
    neuron.addEventListener('mouseenter', stopRoam);
    neuron.addEventListener('mouseleave', function () { if (!chatOpen) startRoam(); });

    window.addEventListener('resize', function () {
        x = Math.min(x, window.innerWidth - SIZE - MARGIN);
        y = Math.min(y, window.innerHeight - SIZE - MARGIN);
        place();
    }, { passive: true });
    document.addEventListener('visibilitychange', function () {
        if (document.hidden) stopRoam(); else if (!chatOpen) startRoam();
    });

    if (reduce) {
        // Reduced motion: dock quietly in the corner, no roaming.
        running = false;
        x = window.innerWidth - SIZE - 24; y = window.innerHeight - SIZE - 24; place();
    } else {
        requestAnimationFrame(roam);
    }
})();
