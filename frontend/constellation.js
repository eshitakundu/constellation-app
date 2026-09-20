/* Deterministic generator shared by the browser and Node verification. */
(function (root) {
  function generateConstellation(input) {
    const text = String(input).slice(0, 60).trim().toLowerCase();
    const stars = Array.from(text, (char, i) => {
      const value = char.codePointAt(0);
      return {
        id: i,
        char,
        x: 0.1 + (((value * 73 + i * 17) % 1000) / 1000) * 0.8,
        y: 0.1 + (((value * 89 + i * 23) % 1000) / 1000) * 0.8,
        size: 0.005 + ((value % 100) / 100) * 0.015,
      };
    });
    const edges = [];
    if (stars.length) {
      const connected = [0],
        remaining = new Set(stars.slice(1).map((s) => s.id));
      while (remaining.size) {
        let best = Infinity,
          edge;
        for (const u of connected)
          for (const v of remaining) {
            const distance = Math.hypot(
              stars[u].x - stars[v].x,
              stars[u].y - stars[v].y,
            );
            if (distance < best) {
              best = distance;
              edge = [u, v];
            }
          }
        edges.push(edge);
        connected.push(edge[1]);
        remaining.delete(edge[1]);
      }
    }
    return { text, stars, edges };
  }
  root.generateConstellation = generateConstellation;
  if (typeof module !== "undefined") module.exports = { generateConstellation };
})(globalThis);
