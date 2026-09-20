/* A name-based game. Each available percentage has its own original line. */
(function (root) {
  const quotes = [
    "You'd argue over the playlist.",
    "Probably better with separate group chats.",
    "Start with coffee. Keep your own ride home.",
    "Agreeing on dinner might take a while.",
    "You'd both insist you know a shortcut.",
    "An interesting conversation. A complicated road trip.",
    "Maybe don't assemble furniture together yet.",
    "You'd finish each other's sentences. Incorrectly.",
    "Someone is definitely stealing the blanket.",
    "Different tastes. Plenty to talk about.",
    "You might need subtitles for each other's jokes.",
    "Worth a second conversation, at least.",
    "Could go either way. Say hello anyway.",
    "You'd disagree, then order the same thing.",
    "A slow start isn't a bad start.",
    "You'd get along better without the group chat.",
    "One plans. One says, 'We'll figure it out.'",
    "The first meeting might need a second chance.",
    "You'd recommend very different films.",
    "Some awkward pauses. Some very good laughs.",
    "You'd pretend not to like their music.",
    "More in common than the first impression suggests.",
    "Enough to stay for another coffee.",
    "You'd have a surprisingly good train conversation.",
    "The jokes might take a minute to land.",
    "You'd remember the little details.",
    "An unlikely addition to each other's favorites.",
    "You'd find a reason to keep talking.",
    "Different weekends. The same sense of humor.",
    "You'd share fries after saying you weren't hungry.",
    "Someone's going to send the first meme.",
    "You'd turn a quick errand into an afternoon.",
    "The conversation wouldn't need much help.",
    "You'd save them a seat without asking.",
    "A good excuse to take the longer way home.",
    "You'd have a running joke by day two.",
    "Even the boring plans would be fun.",
    "You'd send 'this reminded me of you.'",
    "The sort of person you'd call with no news.",
    "You'd notice when the other got quiet.",
    "You'd make room in a very busy week.",
    "One more episode. Then three more.",
    "You'd lose track of time talking.",
    "You'd know their order before they said it.",
    "A comfortable silence is a good sign.",
    "You'd keep the terrible photos, too.",
    "You'd pick each other for the long drive.",
    "The inside jokes would be unbearable to everyone else.",
    "You'd have a favorite place together.",
    "You'd call to tell them before anyone else.",
    "You'd make ordinary Tuesdays worth remembering.",
    "You'd stay on the phone after saying goodnight.",
    "You'd start saying 'we' without noticing.",
    "Their name would be near the top of your messages.",
    "You'd miss them before they left.",
    "You'd still have things to say at 3 a.m.",
    "You'd choose the seat beside them every time.",
    "You'd make plans months ahead and mean them.",
    "The long way home would never feel long enough.",
    "You'd be each other's first call.",
    "You'd find each other in every crowded room.",
    "You already had someone in mind, didn't you?",
  ];
  const normalize = (value) => String(value).slice(0, 60).trim().toLowerCase();
  function getQuote(score) {
    return Number.isInteger(score) && score >= 38 && score <= 99
      ? quotes[score - 38]
      : null;
  }
  function getCompatibility(first, second) {
    const names = [normalize(first), normalize(second)].sort();
    if (!names[0] || !names[1]) return null;
    let hash = 2166136261;
    for (const char of JSON.stringify(names)) {
      hash ^= char.codePointAt(0);
      hash = Math.imul(hash, 16777619) >>> 0;
    }
    const score = 38 + (hash % 62);
    return {
      score,
      title:
        score >= 90
          ? "Quite a match"
          : score >= 75
            ? "Good chemistry"
            : score >= 55
              ? "Worth a try"
              : "Different tastes",
      quote: getQuote(score),
    };
  }
  root.getCompatibility = getCompatibility;
  if (typeof module !== "undefined")
    module.exports = { getCompatibility, getQuote };
})(globalThis);
