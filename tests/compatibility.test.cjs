const test = require("node:test");
const assert = require("node:assert/strict");
const { getCompatibility: match } = require("../frontend/compatibility.js");
const { getQuote } = require("../frontend/compatibility.js");
test("each attainable percentage has exactly one distinct quote", () => {
  const quotes = Array.from({ length: 62 }, (_, i) => getQuote(i + 38));
  assert.ok(
    quotes.every((quote) => typeof quote === "string" && quote.length > 10),
  );
  assert.equal(new Set(quotes).size, 62);
  assert.equal(getQuote(37), null);
  assert.equal(getQuote(100), null);
  for (let i = 0; i < 500; i++) {
    const result = match(`person ${i}`, "someone");
    assert.equal(result.quote, getQuote(result.score));
  }
});
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
