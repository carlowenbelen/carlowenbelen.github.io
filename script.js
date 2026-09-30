// Carl Owen Belen · portfolio. Small, dependency-free.
(() => {
  document.documentElement.classList.remove("no-js");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Year in the footer
  document.getElementById("yr").textContent = new Date().getFullYear();

  // Nav: border on scroll, mobile menu, active link
  const nav = document.querySelector(".nav");
  const menu = document.querySelector(".menu");
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 8);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  menu.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menu.setAttribute("aria-expanded", String(open));
  });
  document.querySelectorAll(".links a").forEach((a) =>
    a.addEventListener("click", () => {
      nav.classList.remove("open");
      menu.setAttribute("aria-expanded", "false");
    })
  );
  const links = [...document.querySelectorAll(".links a")];
  const spy = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        links.forEach((l) => l.classList.toggle("on", l.getAttribute("href") === "#" + e.target.id));
      }),
    { rootMargin: "-45% 0px -50% 0px" }
  );
  ["work", "build", "about", "contact"].forEach((id) => spy.observe(document.getElementById(id)));

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
    // upto = total characters to show across all lines
    let left = upto, out = "";
    for (const line of lines) {
      if (left <= 0) break;
      for (let i = 0; i < line.length; i += 2) {
        const cls = line[i], txt = line[i + 1];
        const part = txt.slice(0, Math.max(0, left));
        left -= txt.length;
        if (part) out += `<span class="${cls}">${esc(part)}</span>`;
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
    let shown = 0;
    const cmdLen = lines[0][1].length + lines[0][3].length;
    const tick = () => {
      shown++;
      render(shown);
      if (shown >= total) {
        setTimeout(() => { shown = 0; tick(); }, 4200);
        return;
      }
      // type the command letter by letter, then print each result line faster
      setTimeout(tick, shown < cmdLen ? 55 : 14);
    };
    setTimeout(tick, 600);
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
