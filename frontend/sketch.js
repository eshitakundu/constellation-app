(() => {
  "use strict";
  const canvas = document.getElementById("sky"),
    ctx = canvas.getContext("2d");
  const input = document.getElementById("star-input"),
    status = document.getElementById("status");
  const motion = document.getElementById("animate");
  const download = document.getElementById("download"),
    share = document.getElementById("share");
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let data = generateConstellation(""),
    started = 0,
    frame = null,
    onScreen = true;
  motion.checked = !reducedMotion.matches;
  const backgroundStars = Array.from({ length: 180 }, (_, i) => ({
    x: ((i * 137.508) % 997) / 997,
    y: ((i * 73.731) % 991) / 991,
    r: 0.5 + (i % 4) * 0.3,
    phase: i * 1.73,
  }));
  function paint(context, width, height, time, exporting = false) {
    context.fillStyle = "#050510";
    context.fillRect(0, 0, width, height);
    const glow = context.createRadialGradient(
      width * 0.4,
      height * 0.4,
      0,
      width * 0.5,
      height * 0.5,
      width * 0.65,
    );
    glow.addColorStop(0, "#211434");
    glow.addColorStop(0.5, "#0e132a");
    glow.addColorStop(1, "#050510");
    context.fillStyle = glow;
    context.fillRect(0, 0, width, height);
    for (const star of backgroundStars) {
      const alpha = 0.28 + 0.22 * (1 + Math.sin(star.phase + time / 1600));
      context.fillStyle = `rgba(224,220,255,${alpha})`;
      context.beginPath();
      context.arc(star.x * width, star.y * height, star.r, 0, Math.PI * 2);
      context.fill();
    }
    const count =
      exporting || !motion.checked
        ? data.edges.length
        : Math.min(data.edges.length, Math.floor((time - started) / 100));
    const visible = new Set(data.stars.length ? [0] : []);
    const point = (s) => [s.x * width, 22 + s.y * (height - 115)];
    context.strokeStyle = "rgba(209,193,255,.5)";
    context.lineWidth = exporting ? 1.7 : 1;
    for (const [u, v] of data.edges.slice(0, Math.max(0, count))) {
      visible.add(u);
      visible.add(v);
      context.beginPath();
      context.moveTo(...point(data.stars[u]));
      context.lineTo(...point(data.stars[v]));
      context.stroke();
    }
    for (const id of visible) {
      const star = data.stars[id],
        [x, y] = point(star),
        r = (1.8 + star.size * 130) * (exporting ? 1.4 : 1);
      context.shadowColor = "#c8adff";
      context.shadowBlur = r * 6;
      context.fillStyle = "#f8f1ff";
      context.beginPath();
      context.arc(x, y, r, 0, Math.PI * 2);
      context.fill();
    }
    context.shadowBlur = 0;
    if (exporting) {
      context.textAlign = "center";
      context.fillStyle = "#eeeaf7";
      let size = 36;
      do {
        context.font = `${size--}px Georgia`;
      } while (context.measureText(data.text).width > width - 100 && size > 12);
      context.fillText(data.text, width / 2, height - 62);
      context.font = "16px sans-serif";
      context.fillStyle = "#b7b1cc";
      context.fillText(
        "YOUR CONSTELLATION · Personal star art",
        width / 2,
        height - 28,
      );
    }
  }
  function render(time = performance.now()) {
    frame = null;
    const ratio = Math.min(devicePixelRatio || 1, 2),
      { width, height } = canvas.getBoundingClientRect();
    if (
      canvas.width !== Math.round(width * ratio) ||
      canvas.height !== Math.round(height * ratio)
    ) {
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
    }
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    paint(ctx, width, height, motion.checked ? time : 0);
    if (motion.checked && !document.hidden && onScreen)
      frame = requestAnimationFrame(render);
  }
  function redraw() {
    if (frame !== null) cancelAnimationFrame(frame);
    render();
  }
  function create(value) {
    const next = generateConstellation(value);
    if (!next.stars.length) {
      status.textContent = "Enter a name or phrase first.";
      input.focus();
      return;
    }
    data = next;
    input.value = value.slice(0, 60);
    started = performance.now();
    document.getElementById("sky-name").textContent = data.text;
    document.getElementById("sky-detail").textContent =
      `${data.stars.length} stars · ${data.edges.length} connections`;
    canvas.setAttribute(
      "aria-label",
      `Artistic constellation for ${data.text}: ${data.stars.length} stars and ${data.edges.length} connections.`,
    );
    status.textContent = "Your constellation is ready to download or share.";
    download.disabled = share.disabled = false;
    document.getElementById("share-fallback").hidden = true;
    redraw();
  }
  document
    .getElementById("constellation-form")
    .addEventListener("submit", (event) => {
      event.preventDefault();
      create(input.value);
    });
  document
    .querySelectorAll("[data-example]")
    .forEach((button) =>
      button.addEventListener("click", () => create(button.dataset.example)),
    );
  motion.addEventListener("change", redraw);
  reducedMotion.addEventListener("change", (event) => {
    motion.checked = !event.matches;
    redraw();
  });
  document.addEventListener("visibilitychange", redraw);
  new ResizeObserver(redraw).observe(canvas.parentElement);
  new IntersectionObserver((entries) => {
    onScreen = entries[0].isIntersecting;
    redraw();
  }).observe(canvas);
  download.addEventListener("click", () => {
    const output = document.createElement("canvas");
    output.width = 1600;
    output.height = 1000;
    paint(output.getContext("2d"), output.width, output.height, 0, true);
    output.toBlob((blob) => {
      if (!blob) {
        status.textContent = "Image export failed. Please try again.";
        return;
      }
      const url = URL.createObjectURL(blob),
        link = document.createElement("a");
      link.href = url;
      link.download = "your-constellation.png";
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      status.textContent = "Your PNG is ready. Check your browser downloads.";
    }, "image/png");
  });
  share.addEventListener("click", async () => {
    const url = new URL(location.href);
    url.search = "";
    url.hash = new URLSearchParams({ text: data.text }).toString();
    try {
      await navigator.clipboard.writeText(url.href);
      status.textContent = "Share link copied. The link includes your text.";
    } catch {
      document.getElementById("share-fallback").hidden = false;
      const field = document.getElementById("share-url");
      field.value = url.href;
      field.focus();
      field.select();
      status.textContent =
        "Copy the selected link to share your constellation.";
    }
  });
  function readLink() {
    const text = new URLSearchParams(location.hash.slice(1)).get("text");
    if (text) create(text);
  }
  addEventListener("hashchange", readLink);
  readLink();
  redraw();
})();
