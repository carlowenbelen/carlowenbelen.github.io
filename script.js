// Owén · portfolio. Small, dependency-free.
(() => {
  document.documentElement.classList.remove("no-js");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Year in the footer
  document.getElementById("yr").textContent = new Date().getFullYear();

  // Nav: background once scrolled, highlight the section in view
  const nav = document.querySelector(".nav");
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 10);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const links = [...document.querySelectorAll(".pills a")];
  if ("IntersectionObserver" in window) {
    // section id -> nav link it belongs to ("How I build" sits under Work, "Tech stack" under About)
    const owner = { hero: "", work: "work", build: "work", about: "about", stack: "about", contact: "contact" };
    const spy = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const target = "#" + owner[e.target.id];
          links.forEach((l) => l.classList.toggle("on", l.getAttribute("href") === target));
        }),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    Object.keys(owner).forEach((id) => spy.observe(document.getElementById(id)));
  }

  // Marquee: repeat each row once so the loop is seamless
  document.querySelectorAll(".track[data-dup]").forEach((t) => {
    [...t.children].forEach((c) => {
      const copy = c.cloneNode(true);
      copy.setAttribute("aria-hidden", "true");
      t.appendChild(copy);
    });
  });

  // Big headings: reveal word by word
  document.querySelectorAll(".sec-head h2, .about-text h2, .contact h2").forEach((h) => {
    h.classList.add("words");
    h.innerHTML = h.textContent.trim().split(/\s+/)
      .map((w, i) => `<span class="wd" style="--i:${i}">${w}</span>`).join(" ");
  });

  // Flagship card: soft spotlight follows the mouse
  const flag = document.querySelector(".flagship");
  flag.addEventListener("pointermove", (e) => {
    const r = flag.getBoundingClientRect();
    flag.style.setProperty("--mx", `${e.clientX - r.left}px`);
    flag.style.setProperty("--my", `${e.clientY - r.top}px`);
  });

  // Stats: count up when they scroll into view
  const nums = document.querySelectorAll(".stats b[data-to]");
  if (!reduce && "IntersectionObserver" in window) {
    const count = (el) => {
      const to = +el.dataset.to, pre = el.dataset.pre || "", suf = el.dataset.suf || "";
      const t0 = performance.now(), dur = 1300;
      const step = (now) => {
        const p = Math.min(1, (now - t0) / dur);
        el.textContent = pre + Math.round(to * (1 - Math.pow(1 - p, 3))) + suf;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    const so = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { count(e.target); so.unobserve(e.target); }
    }), { threshold: .6 });
    nums.forEach((n) => {
      n.textContent = (n.dataset.pre || "") + "0" + (n.dataset.suf || "");
      so.observe(n);
    });
  }

  // Reveal on scroll
  const items = document.querySelectorAll(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("in"));
  } else {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }),
      { rootMargin: "0px 0px -8% 0px" }
    );
    items.forEach((el) => io.observe(el));
  }

  // Headline: "A" stays put, the word after it rotates
  const words = [...document.querySelectorAll(".rot .w")];
  if (words.length > 1 && !reduce) {
    let i = 0;
    setInterval(() => {
      const cur = words[i];
      i = (i + 1) % words.length;
      const next = words[i];
      cur.classList.replace("on", "out");
      next.classList.remove("out");
      next.classList.add("on");
      setTimeout(() => cur.classList.remove("out"), 800);
    }, 2600);
  }

  // Terminal: types a real run of my video pipeline
  const lines = [
    ["p", "$ ", "k", "ve make interview.mp4 --vertical"],
    ["ok", "✓ ", "k", "transcribe  ", "m", "faster-whisper large-v3 · GPU"],
    ["ok", "✓ ", "k", "rough cut   ", "m", "fillers, stutters, retakes removed"],
    ["ok", "✓ ", "k", "audio       ", "m", "-14 LUFS · true peak -1.4 dBTP"],
    ["ok", "✓ ", "k", "graphics    ", "m", "HyperFrames overlays · captions"],
    ["ok", "✓ ", "k", "render      ", "m", "16:9 + 9:16 · QC passed"],
    ["p", "$ ", "k", ""],
  ];
  const term = document.getElementById("term");
  const esc = (s) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
  const render = (upto) => {
    let left = upto, out = "";
    for (const line of lines) {
      if (left <= 0) break;
      for (let i = 0; i < line.length; i += 2) {
        const part = line[i + 1].slice(0, Math.max(0, left));
        left -= line[i + 1].length;
        if (part) out += `<span class="${line[i]}">${esc(part)}</span>`;
        if (left <= 0) break;
      }
      if (left > 0) out += "\n";
    }
    term.innerHTML = out;
  };
  const total = lines.reduce((n, l) => n + l.filter((_, i) => i % 2).join("").length, 0);
  if (reduce) {
    render(total);
  } else {
    let shown = 0, started = false;
    const cmdLen = lines[0][1].length + lines[0][3].length;
    const tick = () => {
      shown++;
      render(shown);
      if (shown >= total) {
        setTimeout(() => { shown = 0; tick(); }, 4500);
        return;
      }
      setTimeout(tick, shown < cmdLen ? 55 : 14);
    };
    // start typing when the terminal scrolls into view
    new IntersectionObserver(([e], obs) => {
      if (e.isIntersecting && !started) { started = true; obs.disconnect(); setTimeout(tick, 300); }
    }, { threshold: .35 }).observe(term);
  }

  // Copy email
  const copy = document.getElementById("copy");
  copy.addEventListener("click", async () => {
    const email = "carlowen.belen@gmail.com";
    try {
      await navigator.clipboard.writeText(email);
      copy.textContent = "Copied ✓";
    } catch {
      copy.textContent = email;
    }
    setTimeout(() => (copy.textContent = "Copy email"), 2200);
  });
})();
