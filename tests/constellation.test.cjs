const test = require("node:test");
const assert = require("node:assert/strict");
const {
  generateConstellation: generate,
} = require("../frontend/constellation.js");

test("empty and single-character inputs need no edges", () => {
  assert.deepEqual(generate("   "), { text: "", stars: [], edges: [] });
  assert.equal(generate("A").stars.length, 1);
  assert.equal(generate("A").edges.length, 0);
});
test("normalization is deterministic and retains original coordinate formula", () => {
  assert.deepEqual(generate("  MOON  "), generate("moon"));
  const star = generate("a").stars[0];
  assert.equal(star.x, 0.1 + 0.081 * 0.8);
  assert.equal(star.y, 0.1 + 0.633 * 0.8);
  assert.notDeepEqual(generate("moon light"), generate("light moon"));
});
test("Unicode uses code points; oversized shared inputs are bounded", () => {
  assert.equal(generate("🌟").stars.length, 1);
  assert.equal(generate("x".repeat(100000)).stars.length, 60);
});
test("every generated pattern forms a connected tree within drawing bounds", () => {
  for (const value of [
    "a",
    "stardust",
    "a new beginning",
    "नमस्ते",
    "🌙✨",
    "x".repeat(60),
  ]) {
    const { stars, edges } = generate(value);
    assert.equal(edges.length, stars.length - 1);
    const connected = new Set([0]);
    for (const [u, v] of edges) {
      assert.ok(connected.has(u));
      assert.ok(!connected.has(v));
      connected.add(v);
    }
    assert.equal(connected.size, stars.length);
    for (const star of stars) {
      assert.ok(star.x >= 0.1 && star.x <= 0.9);
      assert.ok(star.y >= 0.1 && star.y <= 0.9);
    }
  }
});
