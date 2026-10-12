// words.json (faster-whisper word_timestamps) -> karaoke caption clips
// Usage: node words-to-karaoke.mjs words.json --from 0 --to 60 --offset 0 --max-words 3 --out captions.html
import { readFileSync, writeFileSync } from "node:fs";

const args = process.argv.slice(2);
function opt(name, def) { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : def; }
const inFile = args.find((a) => !a.startsWith("--"));
const maxWords = parseInt(opt("--max-words", "3"), 10);
const from = parseFloat(opt("--from", "0"));
const to = parseFloat(opt("--to", "1e9"));
const base = parseFloat(opt("--base", "0"));
const offset = parseFloat(opt("--offset", "0"));
const track = opt("--track", "5");
const outFile = opt("--out", null);

function esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

const data = JSON.parse(readFileSync(inFile, "utf-8"));
// shift into composition time and keep the window
const words = data.words
  .map((w) => ({ text: w.word, start: w.start - base + offset, end: w.end - base + offset }))
  .filter((w) => w.start >= from - 1e-6 && w.start < to)
  .sort((a, b) => a.start - b.start);

// chunk into on-screen groups of <= maxWords
let html = "";
let gid = 0;
for (let i = 0; i < words.length; i += maxWords) {
  const g = words.slice(i, i + maxWords);
  const gs = Math.max(g[0].start, from);
  const ge = Math.min(g[g.length - 1].end, to);
  if (ge - gs < 0.05) continue;
  gid += 1;
  const spans = g
    .map((w) => `<span class="w" style="animation-delay:${Math.max(0, w.start - gs).toFixed(3)}s">${esc(w.text)}</span>`)
    .join(" ");
  html += `<div id="cap-${gid}" class="clip cap" data-start="${gs.toFixed(3)}" data-duration="${(ge - gs).toFixed(3)}" data-track-index="${track}">${spans}</div>\n`;
}

if (outFile) writeFileSync(outFile, html);
else process.stdout.write(html);
console.error(`words=${words.length} groups=${gid}`);
