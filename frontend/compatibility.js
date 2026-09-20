/* A repeatable party-game score, not a relationship assessment. */
(function (root) {
  const normalize = (value) => String(value).slice(0, 60).trim().toLowerCase();
  function getCompatibility(first, second) {
    const names = [normalize(first), normalize(second)].sort();
    if (!names[0] || !names[1]) return null;
    let hash = 2166136261;
    for (const char of JSON.stringify(names)) {
      hash ^= char.codePointAt(0);
      hash = Math.imul(hash, 16777619) >>> 0;
    }
    const score = 38 + (hash % 62);
    const stories =
      score >= 90
        ? [
            "Cosmic collision",
            [
              "The universe took its time. Then put you in the same sky.",
              "Of all the empty space, you found each other.",
              "Some stars were never meant to burn alone.",
            ],
          ]
        : score >= 75
          ? [
              "Same wavelength",
              [
                "Different stars. Suspiciously similar gravity.",
                "You make the silence between the stars feel smaller.",
                "Not the same sky. Somehow, the same direction.",
              ],
            ]
          : score >= 55
            ? [
                "Beautiful interference",
                [
                  "A little chaos is how new galaxies begin.",
                  "Your orbits disagree. Your light does not.",
                  "Some connections need a little space to become extraordinary.",
                ],
              ]
            : [
                "Wild orbits",
                [
                  "Not every sky has to align to be worth looking at.",
                  "Different directions. Still a beautiful collision.",
                  "The stars left this one unwritten. Make it your own.",
                ],
              ];
    return {
      score,
      title: stories[0],
      quote: stories[1][(hash >>> 8) % stories[1].length],
    };
  }
  root.getCompatibility = getCompatibility;
  if (typeof module !== "undefined") module.exports = { getCompatibility };
})(globalThis);
