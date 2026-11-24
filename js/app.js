/* NUR site: language, motion, the living swarm and the live counters. */
(() => {
  "use strict";
  const PLAY_URL = "https://play.google.com/store/apps/details?id=com.nur.journeyoflight";
  const LANGS = window.NUR_LANGS;
  const I18N = window.NUR_I18N;
  const SHOT_LANG = { en: "en", ar: "ar", de: "de", es: "es", fr: "fr", pt: "pt_BR", zh: "zh_CN" };
  const SHOTS = ["01_race", "02_royale", "03_cell_wars", "04_rush", "05_breach", "06_world_board", "07_arena", "08_home"];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
  };

  // ------------------------------------------------------------ language
  function detectLang() {
    const q = new URLSearchParams(location.search).get("lang");
    const saved = store.get("nur_lang");
    for (const c of [q, saved]) if (c && I18N[c]) return c;
    for (const l of navigator.languages || [navigator.language || "en"]) {
      const base = String(l).toLowerCase().split("-")[0];
      if (I18N[base]) return base;
    }
    return "en";
  }
  let lang = detectLang();
  const t = (k) => (I18N[lang] && I18N[lang][k]) || I18N.en[k] || "";

  function applyLang(code, save) {
    lang = I18N[code] ? code : "en";
    if (save) store.set("nur_lang", lang);
    const info = LANGS.find((l) => l.code === lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = info.dir;
    $$("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
    $$("[data-i18n-content]").forEach((el) => el.setAttribute("content", t(el.dataset.i18nContent)));
    $$("[data-i18n-aria]").forEach((el) => el.setAttribute("aria-label", t(el.dataset.i18nAria)));
    document.title = t("meta_title");
    $("#langName").textContent = info.name;
    $$("#langMenu button").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.lang === lang)));
    buildCompare(); buildFaq(); buildRibbon(); buildGallery();
    if (window.lucide) lucide.createIcons();
  }

  function buildLangMenu() {
    const menu = $("#langMenu");
    menu.innerHTML = "";
    for (const l of LANGS) {
      const li = document.createElement("li");
      const b = document.createElement("button");
      b.type = "button"; b.dataset.lang = l.code; b.setAttribute("role", "option");
      b.innerHTML = `<span>${l.name}</span><i data-lucide="check"></i>`;
      b.addEventListener("click", () => { applyLang(l.code, true); $("#lang").classList.remove("open"); $("#langBtn").setAttribute("aria-expanded", "false"); });
      li.appendChild(b); menu.appendChild(li);
    }
    $("#langBtn").addEventListener("click", (e) => {
      e.stopPropagation();
      const open = $("#lang").classList.toggle("open");
      $("#langBtn").setAttribute("aria-expanded", String(open));
    });
    document.addEventListener("click", () => $("#lang").classList.remove("open"));
  }

  // ------------------------------------------------------------ content blocks
  function buildCompare() {
    const rows = [
      ["map", "r_levels", t("r_levels_f"), t("r_levels_p")],
      ["timer", "r_race", t("r_race_f"), t("r_race_p")],
      ["rocket", "r_rush", t("r_rush_f"), t("r_rush_p")],
      ["target", "r_breach", t("r_breach_f"), t("r_breach_p")],
      ["swords", "r_war", t("r_war_f"), t("r_war_p")],
      ["crown", "r_arena", t("r_arena_f"), t("r_arena_p")],
      ["users", "r_royale", t("r_royale_f"), t("r_royale_p")],
      ["ban", "r_ads", true, true],
      ["wifi-off", "r_offline", true, true],
      ["shirt", "r_shop", true, true],
    ];
    const cell = (v, full) => v === true
      ? `<i data-lucide="check-circle-2" class="yes"></i>`
      : `<i data-lucide="${full ? "star" : "circle-dot"}" class="${full ? "star" : "part"}"></i><span>${v}</span>`;
    $("#cmpRows").innerHTML = rows.map(([ico, k, f, p], i) =>
      `<div class="cmp-row" style="transition-delay:${i * 60}ms"><div class="label"><i data-lucide="${ico}"></i><span>${t(k)}</span></div>
       <div class="cell">${cell(f, false)}</div><div class="cell full">${cell(p, true)}</div></div>`).join("");
  }

  function buildFaq() {
    $("#faqList").innerHTML = [1, 2, 3, 4, 5, 6].map((n) =>
      `<details class="qa reveal in"><summary><span>${t("q" + n)}</span><span class="pm"><i data-lucide="plus"></i></span></summary><p>${t("a" + n)}</p></details>`).join("");
  }

  function buildRibbon() {
    const facts = ["j1_d", "j2_d", "j3_d", "j4_d", "j5_d", "j6_d", "pill_ads", "pill_offline", "pill_free"].map(t);
    const html = facts.map((f) => `<span>${f}</span>`).join("");
    $("#ribbon").innerHTML = html + html;
  }

  // ------------------------------------------------------------ gallery
  let current = 0;
  function buildGallery() {
    const track = $("#gTrack");
    const dir = SHOT_LANG[lang] || "en";
    track.innerHTML = SHOTS.map((s, i) =>
      `<button class="g-item" data-i="${i}" type="button"><img src="/assets/shots/${dir}/${s}.webp" alt="NUR screenshot ${i + 1}" loading="lazy" width="1280" height="720"></button>`).join("");
    $("#gDots").innerHTML = SHOTS.map((_, i) => `<button type="button" aria-label="${i + 1}" data-i="${i}"></button>`).join("");
    $$(".g-item", track).forEach((b) => b.addEventListener("click", () => openLightbox(b.querySelector("img").src)));
    $$("#gDots button").forEach((b) => b.addEventListener("click", () => goTo(+b.dataset.i)));
    markCurrent(0);
  }
  function goTo(i) {
    const items = $$(".g-item");
    current = (i + items.length) % items.length;
    const el = items[current];
    const track = $("#gTrack");
    track.scrollTo({ left: el.offsetLeft - (track.clientWidth - el.clientWidth) / 2, behavior: reduced ? "auto" : "smooth" });
    markCurrent(current);
  }
  function markCurrent(i) {
    $$(".g-item").forEach((b, k) => b.classList.toggle("current", k === i));
    $$("#gDots button").forEach((b, k) => b.classList.toggle("on", k === i));
  }
  function wireGallery() {
    const track = $("#gTrack");
    const rtl = () => document.documentElement.dir === "rtl";
    $("#gPrev").addEventListener("click", () => goTo(current + (rtl() ? 1 : -1)));
    $("#gNext").addEventListener("click", () => goTo(current + (rtl() ? -1 : 1)));
    let raf = 0;
    track.addEventListener("scroll", () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const mid = track.getBoundingClientRect().left + track.clientWidth / 2;
        let best = 0, bd = Infinity;
        $$(".g-item", track).forEach((el, k) => { const r = el.getBoundingClientRect(); const d = Math.abs(r.left + r.width / 2 - mid); if (d < bd) { bd = d; best = k; } });
        current = best; markCurrent(best);
      });
    }, { passive: true });
  }

  // ------------------------------------------------------------ modals
  function openModal(id) { const m = $(id); m.hidden = false; document.body.style.overflow = "hidden"; }
  function closeModal(id) { const m = $(id); m.hidden = true; document.body.style.overflow = ""; }
  function openLightbox(src) { $("#lightboxImg").src = src; openModal("#lightbox"); }
  function wireModals() {
    $("#trailerBtn").addEventListener("click", () => { openModal("#trailer"); const v = $("#trailerVideo"); v.currentTime = 0; v.play().catch(() => {}); });
    const shut = () => { $("#trailerVideo").pause(); closeModal("#trailer"); };
    $("#trailerClose").addEventListener("click", shut);
    $("#lightboxClose").addEventListener("click", () => closeModal("#lightbox"));
    for (const id of ["#trailer", "#lightbox"]) $(id).addEventListener("click", (e) => { if (e.target === e.currentTarget) id === "#trailer" ? shut() : closeModal(id); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") { shut(); closeModal("#lightbox"); } });
  }

  // ------------------------------------------------------------ nav & reveal
  function wireNav() {
    const nav = $("#nav");
    const onScroll = () => nav.classList.toggle("scrolled", scrollY > 20);
    addEventListener("scroll", onScroll, { passive: true }); onScroll();
    $("#burger").addEventListener("click", () => $("#navLinks").classList.toggle("open"));
    $$("#navLinks a").forEach((a) => a.addEventListener("click", () => $("#navLinks").classList.remove("open")));
    const links = $$("#navLinks a");
    const spy = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
    }), { rootMargin: "-45% 0px -50% 0px" });
    $$("section[id]").forEach((s) => spy.observe(s));
  }
  function wireReveal() {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("in");
      if (e.target.classList.contains("compare")) e.target.classList.add("in");
      e.target.querySelectorAll?.(".count").forEach(countUp);
      io.unobserve(e.target);
    }), { threshold: 0.14 });
    $$(".reveal, .stats").forEach((el, i) => { el.style.transitionDelay = `${(i % 3) * 90}ms`; io.observe(el); });
  }
  function countUp(el) {
    const end = +el.dataset.count || 0;
    if (reduced || end === 0) { el.textContent = end.toLocaleString(lang); return; }
    const t0 = performance.now(), dur = 1600;
    const step = (now) => { const k = Math.min(1, (now - t0) / dur); el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3))).toLocaleString(lang); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }
  function wireTilt() {
    if (reduced || matchMedia("(hover: none)").matches) return;
    $$(".tilt").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - 0.5; const y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(900px) rotateY(${x * 7}deg) rotateX(${-y * 7}deg) translateY(-4px)`;
        el.style.setProperty("--mx", `${(x + 0.5) * 100}%`); el.style.setProperty("--my", `${(y + 0.5) * 100}%`);
      });
      el.addEventListener("pointerleave", () => { el.style.transform = ""; });
    });
  }
  function wireRoad() {
    const road = $("#road");
    const bar = document.createElement("div"); bar.className = "progress"; road.prepend(bar);
    const update = () => {
      const r = road.getBoundingClientRect(); const k = (innerHeight * 0.6 - r.top) / r.height;
      bar.style.setProperty("--p", `${Math.max(0, Math.min(1, k)) * 100}%`);
    };
    addEventListener("scroll", update, { passive: true }); update();
  }

  // ------------------------------------------------------------ Play links & stats
  function toast(msg) { const el = $("#toast"); el.textContent = msg; el.classList.add("show"); setTimeout(() => el.classList.remove("show"), 2200); }
  function wirePlayLinks() {
    $$(".play-link").forEach((a) => {
      a.href = PLAY_URL; a.target = "_blank"; a.rel = "noopener";
      a.addEventListener("click", () => { toast(t("toast_play")); track("download"); });
    });
  }
  async function track(event) {
    try { await fetch(`/api/stats?event=${event}`, { method: "POST", keepalive: true }); } catch { /* offline or not deployed */ }
  }
  async function loadStats() {
    // A visit counts once a day per browser; the download count is real taps
    // on "Get it on Google Play". Installs come from the owner's own Play
    // Console number (an env var), shown only when set.
    const today = new Date().toISOString().slice(0, 10);
    const first = store.get("nur_visit") !== today;
    if (first) store.set("nur_visit", today);
    try {
      const res = await fetch(`/api/stats${first ? "?event=visit" : ""}`, { method: first ? "POST" : "GET" });
      if (!res.ok) return;
      const s = await res.json();
      if (!s.enabled) return;
      const show = (id, v) => { const box = $(id); box.hidden = false; const b = box.querySelector(".count"); b.dataset.count = v; countUp(b); };
      show("#statVisitors", s.visits || 0);
      show("#statDownloads", s.downloads || 0);
      if (s.installs) { $("#statInstalls").hidden = false; $("#installsValue").textContent = s.installs; }
    } catch { /* the static preview has no API */ }
  }

  // ------------------------------------------------------------ the living swarm
  // Nur (gold) leads a stream of pale rivals through the water; on a phone
  // the swarm is smaller, and it rests when the tab is hidden.
  function swarm() {
    const cv = $("#swarm"); const ctx = cv.getContext("2d");
    let w = 0, h = 0, dpr = 1, raf = 0, time = 0;
    const small = innerWidth < 700;
    const N = reduced ? 0 : (small ? 16 : 34);
    const pointer = { x: -1, y: -1, active: false };
    const fishes = [];
    const resize = () => { dpr = Math.min(devicePixelRatio || 1, 2); w = innerWidth; h = innerHeight; cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    resize(); addEventListener("resize", resize);
    const make = (lead) => ({ x: Math.random() * w, y: Math.random() * h, a: Math.random() * 6.28, v: lead ? 1.7 : 0.8 + Math.random() * 1.1,
      s: lead ? 1.5 : 0.55 + Math.random() * 0.6, ph: Math.random() * 10, lead, hue: Math.random(), trail: [] });
    for (let i = 0; i < N; i++) fishes.push(make(i === 0));
    addEventListener("pointermove", (e) => { pointer.x = e.clientX; pointer.y = e.clientY; pointer.active = true; }, { passive: true });
    addEventListener("pointerleave", () => { pointer.active = false; });

    const draw = (f) => {
      const len = 46 * f.s, seg = 12;
      ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(f.a);
      // Tail: a travelling wave that grows toward the tip.
      ctx.beginPath(); ctx.moveTo(-8 * f.s, 0);
      for (let i = 1; i <= seg; i++) {
        const k = i / seg; const x = -8 * f.s - k * len;
        const y = Math.sin(time * 9 * (f.lead ? 1.2 : 1) + f.ph - k * 5.5) * k * 7 * f.s;
        ctx.lineTo(x, y);
      }
      const grad = ctx.createLinearGradient(-8 * f.s, 0, -8 * f.s - len, 0);
      const col = f.lead ? "255,209,102" : (f.hue > 0.5 ? "201,166,255" : "128,240,214");
      grad.addColorStop(0, `rgba(${col},${f.lead ? 0.95 : 0.5})`); grad.addColorStop(1, `rgba(${col},0)`);
      ctx.strokeStyle = grad; ctx.lineWidth = 2.6 * f.s; ctx.lineCap = "round"; ctx.stroke();
      // Head: a glossy oval with a soft halo.
      const hr = 9 * f.s;
      const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, hr * 3.2);
      glow.addColorStop(0, `rgba(${col},${f.lead ? 0.45 : 0.18})`); glow.addColorStop(1, `rgba(${col},0)`);
      ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(0, 0, hr * 3.2, 0, 6.283); ctx.fill();
      const body = ctx.createRadialGradient(-hr * 0.3, -hr * 0.35, hr * 0.1, 0, 0, hr * 1.2);
      body.addColorStop(0, "rgba(255,255,255,0.98)"); body.addColorStop(1, f.lead ? "rgba(255,200,90,0.95)" : `rgba(${col},0.75)`);
      ctx.fillStyle = body; ctx.beginPath(); ctx.ellipse(0, 0, hr * 1.25, hr * 0.85, 0, 0, 6.283); ctx.fill();
      ctx.restore();
    };

    const tick = () => {
      time += 1 / 60;
      ctx.clearRect(0, 0, w, h);
      const fade = Math.max(0.25, 1 - scrollY / (innerHeight * 1.4));
      ctx.globalAlpha = fade;
      const lead = fishes[0];
      for (const f of fishes) {
        // Wander, follow the leader (or the pointer for Nur), keep on screen.
        let target = null;
        if (f.lead) target = pointer.active ? pointer : { x: w * (0.5 + 0.38 * Math.cos(time * 0.21)), y: h * (0.45 + 0.3 * Math.sin(time * 0.33)) };
        else if (lead) target = { x: lead.x - Math.cos(lead.a) * 60 + Math.sin(f.ph + time) * 80, y: lead.y - Math.sin(lead.a) * 60 + Math.cos(f.ph * 1.3 + time) * 80 };
        let want = f.a + Math.sin(time * 0.7 + f.ph) * 0.02;
        if (target) {
          const dx = target.x - f.x, dy = target.y - f.y, d = Math.hypot(dx, dy);
          const pull = f.lead ? 0.06 : (d > 280 ? 0.035 : 0.008);
          let diff = Math.atan2(dy, dx) - f.a; diff = Math.atan2(Math.sin(diff), Math.cos(diff));
          want = f.a + diff * pull * 60 / 60;
        }
        f.a = want;
        const sp = f.v * (f.lead && pointer.active ? 2.2 : 1) * (1 + Math.sin(time * 9 + f.ph) * 0.15);
        f.x += Math.cos(f.a) * sp; f.y += Math.sin(f.a) * sp;
        const m = 80;
        if (f.x < -m) f.x = w + m; if (f.x > w + m) f.x = -m; if (f.y < -m) f.y = h + m; if (f.y > h + m) f.y = -m;
      }
      for (let i = fishes.length - 1; i >= 0; i--) draw(fishes[i]);
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    };
    if (N > 0) raf = requestAnimationFrame(tick);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) cancelAnimationFrame(raf); else if (N > 0) raf = requestAnimationFrame(tick);
    });
  }

  // ------------------------------------------------------------ boot
  function boot() {
    $("#year").textContent = new Date().getFullYear();
    buildLangMenu(); wireGallery(); wireModals(); wireNav(); wirePlayLinks();
    applyLang(lang, false);
    wireReveal(); wireTilt(); wireRoad(); swarm(); loadStats();
    // Keep the hero film light: pause it while it is off screen.
    const v = $("#heroVideo");
    if (reduced) v.pause();
    new IntersectionObserver(([e]) => { if (reduced) return; e.isIntersecting ? v.play().catch(() => {}) : v.pause(); }).observe(v);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
