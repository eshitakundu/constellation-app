const test = require("node:test");
const assert = require("node:assert/strict");
const { getCompatibility: match } = require("../frontend/compatibility.js");
test("pair score is repeatable, case-insensitive, and independent of order", () => {
  assert.deepEqual(match("  Luna ", "NOVA"), match("nova", "luna"));
  assert.deepEqual(match("luna", "nova"), match("luna", "nova"));
});
test("empty names do not produce a relationship result", () => {
  assert.equal(match("", "Nova"), null);
  assert.equal(match("Luna", "   "), null);
});
test("scores and quotes remain valid for Unicode and long inputs", () => {
  const results = new Set();
  for (let i = 0; i < 150; i++) {
    const result = match(`🌙 name ${i}`, "✨नमस्ते");
    assert.ok(result.score >= 38 && result.score <= 99);
    assert.ok(result.title && result.quote);
    results.add(result.score);
  }
  assert.ok(results.size > 30);
  assert.deepEqual(match("x".repeat(10000), "a"), match("x".repeat(60), "a"));
});
