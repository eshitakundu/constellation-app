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
  const stars = Array.from({ length: 380 }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: 0.4 + Math.random() * 1.35,
    phase: Math.random() * Math.PI * 2,
    period: 1800 + Math.random() * 2200,
    drift: 0.0000004 + Math.random() * 0.000001,
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
        w * (x + Math.sin(time / 24000) * 0.025),
        h * (y + Math.cos(time / 29000) * 0.025),
        0,
        w * (x + Math.sin(time / 24000) * 0.025),
        h * (y + Math.cos(time / 29000) * 0.025),
        Math.max(w, h) * r,
      );
      g.addColorStop(0, color);
      g.addColorStop(1, "rgba(0,0,0,0)");
      context.fillStyle = g;
      context.fillRect(0, 0, w, h);
    }
    for (const s of stars) {
      const brightness =
        0.08 +
        0.84 * Math.pow((1 + Math.sin(s.phase + time / s.period)) / 2, 1.6);
      context.fillStyle = `rgba(240,233,255,${brightness})`;
      context.beginPath();
      context.arc(
        ((((s.x - time * s.drift) % 1) + 1) % 1) * w,
        s.y * h,
        s.r,
        0,
        Math.PI * 2,
      );
      context.fill();
    }
  }
  function drawMap(context, data, region, color, time, complete) {
    if (!data) return [];
    const centerX =
      (Math.min(...data.stars.map((s) => s.x)) +
        Math.max(...data.stars.map((s) => s.x))) /
      2;
    const centerY =
      (Math.min(...data.stars.map((s) => s.y)) +
        Math.max(...data.stars.map((s) => s.y))) /
      2;
    const points = data.stars.map((s) => [
      region.x + region.w / 2 + (s.x - centerX) * region.w,
      region.y + region.h / 2 + (s.y - centerY) * region.h,
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
    if (count < data.edges.length) {
      const [u, v] = data.edges[count],
        fraction = data.edges.length * progress - count;
      context.globalAlpha = 0.65;
      context.beginPath();
      context.moveTo(...points[u]);
      context.lineTo(
        points[u][0] + (points[v][0] - points[u][0]) * fraction,
        points[u][1] + (points[v][1] - points[u][1]) * fraction,
      );
      context.stroke();
    }
    context.globalAlpha = 1;
    for (const i of visible) {
      const [x, y] = points[i],
        r = 1.5 + data.stars[i].size * 100;
      const pulse =
        complete || !motion.checked
          ? 1
          : 0.78 + 0.22 * Math.sin(time / 1600 + i * 1.7);
      context.shadowBlur = 18 + pulse * 14;
      context.globalAlpha = 0.6 + pulse * 0.4;
      context.fillStyle = "#fff";
      context.beginPath();
      context.arc(x, y, r, 0, Math.PI * 2);
      context.fill();
      context.shadowBlur = 0;
      context.strokeStyle = color;
      context.globalAlpha = 0.12 + pulse * 0.09;
      context.beginPath();
      context.arc(x, y, r * (2.7 + pulse), 0, Math.PI * 2);
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
  function fitText(context, text, maxWidth, startSize, font = "Cormorant") {
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
      c.font = "115px Cormorant";
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
        "For fun. Names cannot predict a relationship.",
        w / 2,
        h * 0.9,
      );
    } else {
      c.fillStyle = "#eee4ff";
      c.font = "32px Cormorant";
      c.fillText("Your constellation.", w / 2, h * 0.77);
      c.fillStyle = "#c29aff";
      c.font = "22px sans-serif";
      c.fillText("ADD A NAME. COMPARE YOUR STARS.", w / 2, h * 0.85);
    }
    c.fillStyle = "#8e849f";
    c.font = "16px sans-serif";
    c.fillText("constellation.eshita.dev", w / 2, h - 45);
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
    document.body.classList.toggle("motion-paused", !motion.checked);
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
      ? "YOUR CONSTELLATIONS"
      : "YOUR CONSTELLATION";
    $("sky-detail").textContent = second
      ? "VIOLET / YOU     ·     ICE BLUE / THEM"
      : `${first.stars.length} STARS`;
    $("match-result").hidden = !match;
    $("solo-quote").hidden = Boolean(match);
    if (match) {
      $("match-score").textContent = `${match.score}%`;
      $("match-type").textContent = match.title;
      $("match-quote").textContent = match.quote;
    }
    $("add-person").textContent = match
      ? "Compare another name ↗"
      : "Compare names ↗";
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
      $("entry-status").textContent = "Enter a name first.";
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
      $("status").textContent = "Enter their name to compare.";
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
        ? "Invitation copied. They can add their name."
        : "Result link copied.";
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
  $("download").addEventListener("click", async () => {
    await document.fonts.ready;
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
    $("intro-kicker").textContent = invitation ? "COMPARE YOUR NAMES" : "";
    $("intro-copy").textContent = invitation
      ? `${invitation} invited you to compare names.`
      : "Enter a name. See its constellation.";
    $("input-help").textContent = invitation
      ? "Enter your name to see your result."
      : "Press enter to begin.";
    const text = params.get("text");
    if (text && text.trim()) show(text, params.get("with") || "");
    else if (dialog.open) close();
  }
  addEventListener("hashchange", readLink);
  readLink();
  redraw();
})();
