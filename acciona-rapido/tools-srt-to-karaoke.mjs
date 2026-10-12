// SRT (segment-level, faster-whisper) -> karaoke caption HTML for HyperFrames.
//
// Usage:
//     node srt-to-karaoke.mjs captions.srt [--max-words 4] [--out captions.html]
//
// Strategy: words inside each cue share the cue window proportionally to their
// character length (whisper small on this repo has no word timestamps). Words are
// chunked into on-screen groups of at most --max-words words; each group becomes
// a .clip whose window envelops its words (group.in <= min word start).
import { readFileSync, writeFileSync } from "node:fs";

const args = process.argv.slice(2);
const inFile = args.find((a) => !a.startsWith("--"));
function opt(name, def) {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : def;
}
const maxWords = parseInt(opt("--max-words", "4"), 10);
const outFile = opt("--out", null);
// composition window: keep cues overlapping [from, to] (SRT seconds),
// retime them as (t - base + offset) so 0 = composition start.
const from = parseFloat(opt("--from", "0"));
const to = parseFloat(opt("--to", "1e9"));
const base = parseFloat(opt("--base", "0"));
const offset = parseFloat(opt("--offset", "0"));

function toSec(ts) {
  const m = ts.match(/(\d+):(\d+):([\d.]+)/);
  return parseInt(m[1], 10) * 3600 + parseInt(m[2], 10) * 60 + parseFloat(m[3].replace(",", "."));
}

function esc(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const raw = readFileSync(inFile, "utf-8").replace(/\r/g, "");
const blocks = raw.split(/\n\s*\n/).filter(Boolean);
const cues = [];
for (const b of blocks) {
  const lines = b.split("\n").filter((l) => l.trim() !== "");
  if (lines.length < 3) continue;
  const tm = lines[1].split("-->");
  if (tm.length !== 2) continue;
  cues.push({ start: toSec(tm[0].trim()), end: toSec(tm[1].trim()), text: lines.slice(2).join(" ").trim() });
}

// keep cues overlapping the window; word times are computed from the FULL cue
// (clipping first would compress intra-cue timing), then words outside are dropped.
const kept = [];
for (const c of cues) {
  if (c.end <= from || c.start >= to) continue;
  kept.push({ start: c.start - base + offset, end: c.end - base + offset, text: c.text });
}
kept.sort((a, b) => a.start - b.start);

// cue -> timed words (proportional to char length)
const words = [];
for (const c of kept) {
  const toks = c.text.split(/\s+/).filter(Boolean);
  if (!toks.length) continue;
  const total = toks.reduce((n, t) => n + t.length, 0) || 1;
  const dur = Math.max(0.01, c.end - c.start);
  let t = c.start;
  toks.forEach((tok, i) => {
    const w = (dur * tok.length) / total;
    const end = i === toks.length - 1 ? c.end : t + w;
    // drop words outside the composition window (times are composition seconds)
    const winStart = from - base + offset;
    const winEnd = to - base + offset;
    if (end > winStart && t < winEnd) words.push({ text: tok, start: t, end });
    t = end;
  });
}

// chunk into on-screen groups
let html = "";
let gid = 0;
for (let i = 0; i < words.length; i += maxWords) {
  const g = words.slice(i, i + maxWords);
  const gs = g[0].start;
  const ge = g[g.length - 1].end;
  gid += 1;
  const spans = g
    .map(
      (w) =>
        `<span class="w" style="animation-delay:${w.start.toFixed(3)}s">${esc(w.text)}</span>`
    )
    .join(" ");
  html += `<div id="cap-${gid}" class="clip cap" data-start="${gs.toFixed(3)}" data-duration="${(ge - gs).toFixed(3)}" data-track-index="5">${spans}</div>\n`;
}

if (outFile) writeFileSync(outFile, html);
else process.stdout.write(html);
console.error(`cues=${cues.length} words=${words.length} groups=${gid}`);
