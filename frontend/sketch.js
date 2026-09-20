(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const canvas = $("sky"),
    ambient = $("ambient"),
    dialog = $("universe");
  const motion = $("animate"),
    reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let first = null,
    second = null,
    match = null,
    invitation = "",
    started = 0,
    frame = null;
  motion.checked = !reduced.matches;
  const stars = Array.from({ length: 260 }, (_, i) => ({
    x: ((i * 137.508) % 997) / 997,
    y: ((i * 73.731) % 991) / 991,
    r: 0.4 + (i % 5) * 0.23,
    phase: i * 1.73,
  }));
  function sky(context, w, h, time) {
    context.fillStyle = "#020207";
    context.fillRect(0, 0, w, h);
    for (const [x, y, color, r] of [
      [0.3, 0.42, "rgba(119,26,215,.24)", 0.55],
      [0.72, 0.48, "rgba(15,98,167,.18)", 0.45],
      [0.5, 0.75, "rgba(198,32,93,.09)", 0.35],
    ]) {
      const g = context.createRadialGradient(
        w * x,
        h * y,
        0,
        w * x,
        h * y,
        Math.max(w, h) * r,
      );
      g.addColorStop(0, color);
      g.addColorStop(1, "rgba(0,0,0,0)");
      context.fillStyle = g;
      context.fillRect(0, 0, w, h);
    }
    for (const s of stars) {
      context.fillStyle = `rgba(230,227,255,${0.18 + 0.3 * (1 + Math.sin(s.phase + time / 1900))})`;
      context.beginPath();
      context.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
      context.fill();
    }
  }
  function drawMap(context, data, region, color, time, complete) {
    if (!data) return [];
    const points = data.stars.map((s) => [
      region.x + s.x * region.w,
      region.y + s.y * region.h,
    ]);
    const progress =
      complete || !motion.checked
        ? 1
        : Math.min(1, Math.max(0, (time - started) / 1700));
    const count = Math.floor(data.edges.length * progress),
      visible = new Set([0]);
    context.strokeStyle = color;
    context.lineWidth = 1;
    context.shadowColor = color;
    context.shadowBlur = 8;
    for (const [u, v] of data.edges.slice(0, count)) {
      context.globalAlpha = 0.55;
      context.beginPath();
      context.moveTo(...points[u]);
      context.lineTo(...points[v]);
      context.stroke();
      visible.add(u);
      visible.add(v);
    }
    context.globalAlpha = 1;
    for (const i of visible) {
      const [x, y] = points[i],
        r = 1.5 + data.stars[i].size * 100;
      context.shadowBlur = 23;
      context.fillStyle = "#fff";
      context.beginPath();
      context.arc(x, y, r, 0, Math.PI * 2);
      context.fill();
      context.shadowBlur = 0;
      context.strokeStyle = color;
      context.globalAlpha = 0.32;
      context.beginPath();
      context.arc(x, y, r * 3.5, 0, Math.PI * 2);
      context.stroke();
      context.globalAlpha = 1;
    }
    context.shadowBlur = 0;
    return points;
  }
  function paint(context, w, h, time, exporting = false) {
    sky(context, w, h, time);
    if (!first) return;
    // Reserve the top for names and the bottom for the result and controls.
    const canvasTop = exporting ? 0 : canvas.getBoundingClientRect().top;
    const heading = exporting
      ? null
      : document.querySelector(".sky-heading").getBoundingClientRect();
    const controls = exporting
      ? null
      : document.querySelector(".universe-bottom").getBoundingClientRect();
    const top = exporting ? h * 0.19 : heading.bottom - canvasTop + 12;
    const bottom = exporting
      ? h * 0.63
      : Math.max(top + 60, controls.top - canvasTop + 70);
    const region = {
      x: w * 0.05,
      y: top,
      w: w * 0.9,
      h: Math.max(60, bottom - top),
    };
    const pair = Boolean(second);
    const left = pair ? { ...region, x: w * 0.025, w: w * 0.6 } : region;
    const right = { ...region, x: w * 0.375, w: w * 0.6 };
    const a = drawMap(context, first, left, "#c29aff", time, exporting);
    const b = drawMap(context, second, right, "#6be8ff", time, exporting);
    if (pair && (exporting || !motion.checked || time - started > 1700)) {
      // Join the nearest stars from the two independently generated skies.
      let distance = Infinity,
        bridge;
      for (const p of a)
        for (const q of b) {
          const d = Math.hypot(p[0] - q[0], p[1] - q[1]);
          if (d < distance) {
            distance = d;
            bridge = [p, q];
          }
        }
      context.strokeStyle = "#ffda91";
      context.shadowColor = "#ffb756";
      context.shadowBlur = 18;
      context.lineWidth = 1.5;
      context.setLineDash([3, 7]);
      context.beginPath();
      context.moveTo(...bridge[0]);
      context.lineTo(...bridge[1]);
      context.stroke();
      context.setLineDash([]);
      context.shadowBlur = 0;
    }
    if (exporting) exportType(context, w, h);
  }
  function fitText(context, text, maxWidth, startSize, font = "Georgia") {
    let size = startSize;
    do {
      context.font = `${size--}px ${font}`;
    } while (context.measureText(text).width > maxWidth && size > 9);
  }
  function exportType(c, w, h) {
    c.textAlign = "center";
    c.fillStyle = "#b5a8c9";
    c.font = "18px sans-serif";
    c.fillText("Y O U R   C O N S T E L L A T I O N", w / 2, 65);
    const name = second ? `${first.text} × ${second.text}` : first.text;
    c.fillStyle = "#fff";
    fitText(c, name, w - 90, 62);
    c.fillText(name, w / 2, 140);
    if (match) {
      c.fillStyle = "#fff";
      c.font = "115px Georgia";
      c.fillText(`${match.score}%`, w / 2, h * 0.735);
      c.fillStyle = "#c29aff";
      c.font = "25px sans-serif";
      c.fillText(match.title.toUpperCase(), w / 2, h * 0.785);
      c.fillStyle = "#fff";
      fitText(c, match.quote, w - 100, 28);
      c.fillText(match.quote, w / 2, h * 0.835);
      c.fillStyle = "#b5a8c9";
      c.font = "17px sans-serif";
      c.fillText(
        "A little cosmic fiction. Not a relationship prediction.",
        w / 2,
        h * 0.9,
      );
    } else {
      c.fillStyle = "#eee4ff";
      c.font = "italic 32px Georgia";
      c.fillText("An entire universe, disguised as a name.", w / 2, h * 0.77);
      c.fillStyle = "#c29aff";
      c.font = "22px sans-serif";
      c.fillText("WHO BELONGS IN YOUR ORBIT?", w / 2, h * 0.85);
    }
    c.fillStyle = "#8e849f";
    c.font = "16px sans-serif";
    c.fillText("Create your sky. Find your collision.", w / 2, h - 45);
  }
  function render(time = performance.now()) {
    frame = null;
    const target = dialog.open ? canvas : ambient;
    const w = target.clientWidth,
      h = target.clientHeight,
      ratio = Math.min(devicePixelRatio || 1, 2);
    if (
      target.width !== Math.round(w * ratio) ||
      target.height !== Math.round(h * ratio)
    ) {
      target.width = Math.round(w * ratio);
      target.height = Math.round(h * ratio);
    }
    const c = target.getContext("2d");
    c.setTransform(ratio, 0, 0, ratio, 0, 0);
    const t = motion.checked ? time : 0;
    if (dialog.open) paint(c, w, h, t);
    else sky(c, w, h, t);
    if (motion.checked && !document.hidden)
      frame = requestAnimationFrame(render);
  }
  function redraw() {
    if (frame !== null) cancelAnimationFrame(frame);
    render();
  }
  function show(firstName, secondName = "") {
    first = generateConstellation(firstName);
    second = secondName ? generateConstellation(secondName) : null;
    if (!first.stars.length || (second && !second.stars.length)) return;
    match = second ? getCompatibility(first.text, second.text) : null;
    started = performance.now();
    $("sky-name").textContent = second
      ? `${first.text} × ${second.text}`
      : first.text;
    $("sky-name").classList.toggle(
      "long-name",
      $("sky-name").textContent.length > 42,
    );
    $("sky-kicker").textContent = second
      ? "TWO SKIES. ONE COLLISION."
      : "ONE NAME. AN ENTIRE UNIVERSE.";
    $("sky-detail").textContent = second
      ? "VIOLET / YOU     ·     ICE BLUE / THEM"
      : `${first.stars.length} STARS · ONE OF A KIND FEELING`;
    $("match-result").hidden = !match;
    $("solo-quote").hidden = Boolean(match);
    if (match) {
      $("match-score").textContent = `${match.score}%`;
      $("match-type").textContent = match.title;
      $("match-quote").textContent = match.quote;
    }
    $("add-person").textContent = match
      ? "Try another orbit ↗"
      : "Let another sky in ↗";
    $("pair-form").hidden = true;
    $("share-fallback").hidden = true;
    $("status").textContent = "";
    canvas.setAttribute(
      "aria-label",
      second
        ? `Constellations for ${first.text} and ${second.text}. Playful compatibility: ${match.score} percent. ${match.title}. ${match.quote}`
        : `Constellation for ${first.text}, with ${first.stars.length} stars.`,
    );
    document.body.classList.add("result-open");
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
    $("back").focus({ preventScroll: true });
    redraw();
  }
  function close() {
    dialog.close();
  }
  dialog.addEventListener("close", () => {
    document.body.classList.remove("result-open");
    $("pair-form").hidden = true;
    redraw();
    $("star-input").focus({ preventScroll: true });
  });
  $("back").addEventListener("click", close);
  $("constellation-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const name = $("star-input").value.trim();
    if (!name) {
      $("entry-status").textContent = "Give your sky a name first.";
      return;
    }
    $("entry-status").textContent = "";
    if (invitation) show(invitation, name);
    else show(name);
  });
  $("add-person").addEventListener("click", () => {
    $("pair-form").hidden = false;
    $("partner-input").value = second ? second.text : "";
    $("partner-input").focus();
  });
  $("cancel-pair").addEventListener("click", () => {
    $("pair-form").hidden = true;
    $("add-person").focus();
  });
  $("pair-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const name = $("partner-input").value.trim();
    if (!name) {
      $("status").textContent = "Enter their name to discover your shared sky.";
      return;
    }
    show(first.text, name);
  });
  motion.addEventListener("change", redraw);
  reduced.addEventListener("change", (event) => {
    motion.checked = !event.matches;
    redraw();
  });
  document.addEventListener("visibilitychange", redraw);
  addEventListener("resize", redraw);
  new ResizeObserver(redraw).observe(dialog);
  async function copy(invite = false) {
    const url = new URL(location.href);
    url.search = "";
    const params = invite
      ? { invite: first.text }
      : second
        ? { text: first.text, with: second.text }
        : { text: first.text };
    url.hash = new URLSearchParams(params).toString();
    try {
      await navigator.clipboard.writeText(url.href);
      $("status").textContent = invite
        ? "Invitation copied. They add their name to discover your collision."
        : "Result link copied. Send your sky to someone.";
    } catch {
      $("share-fallback").hidden = false;
      $("share-url").value = url.href;
      $("share-url").focus();
      $("share-url").select();
      $("status").textContent =
        "Copy the selected link. It includes the names in this sky.";
    }
  }
  $("share").addEventListener("click", () => copy());
  $("invite").addEventListener("click", () => copy(true));
  $("download").addEventListener("click", () => {
    const output = document.createElement("canvas");
    output.width = 1080;
    output.height = 1350;
    paint(output.getContext("2d"), 1080, 1350, 0, true);
    output.toBlob((blob) => {
      if (!blob) {
        $("status").textContent = "Could not export the image. Try again.";
        return;
      }
      const url = URL.createObjectURL(blob),
        link = document.createElement("a");
      link.href = url;
      link.download = match
        ? "our-cosmic-collision.png"
        : "your-constellation.png";
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      $("status").textContent = "Image saved to your browser downloads.";
    }, "image/png");
  });
  function readLink() {
    const params = new URLSearchParams(location.hash.slice(1));
    invitation = (params.get("invite") || "").slice(0, 60).trim();
    $("intro-kicker").textContent = invitation
      ? "YOU HAVE BEEN INVITED INTO SOMEONE’S ORBIT."
      : "Some connections are written in the dark.";
    $("intro-copy").textContent = invitation
      ? `${invitation} left a space in their sky. Enter your name to discover your collision.`
      : "You are more than a name. You are a whole sky waiting to happen.";
    $("input-help").textContent = invitation
      ? "Your name + their sky. What happens next?"
      : "Enter your name. Meet your stars.";
    const text = params.get("text");
    if (text && text.trim()) show(text, params.get("with") || "");
    else if (dialog.open) close();
  }
  addEventListener("hashchange", readLink);
  readLink();
  redraw();
})();
