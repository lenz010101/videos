"""Transcribe audio files to SRT captions with faster-whisper (cloud runner).

Usage:
    python transcribe.py --input audio/nota.wav --model small --language es --output-dir captions
    python transcribe.py --input audio/ --model base --language es --output-dir captions
"""
import argparse
import json
import sys
from pathlib import Path

FORMATS = (".wav", ".mp3", ".m4a", ".ogg", ".flac", ".mp4", ".mov", ".mkv")


def to_srt(segments, path: Path) -> None:
    def ts(t: float) -> str:
        h, rem = divmod(int(t * 1000), 3_600_000)
        m, rem = divmod(rem, 60_000)
        s, ms = divmod(rem, 1000)
        return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"

    with path.open("w", encoding="utf-8") as f:
        for i, seg in enumerate(segments, 1):
            f.write(f"{i}\n{ts(seg.start)} --> {ts(seg.end)}\n{seg.text.strip()}\n\n")


def to_words_json(segments, path: Path) -> None:
    """Word-level timestamps for karaoke captions."""
    words = []
    for seg in segments:
        for w in getattr(seg, "words", None) or []:
            words.append({
                "word": w.word.strip(),
                "start": round(w.start, 3),
                "end": round(w.end, 3),
            })
    payload = {"language": "es", "word_count": len(words), "words": words}
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=1), encoding="utf-8")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--input", required=True, help="audio file or directory")
    ap.add_argument("--model", default="small", help="tiny|base|small|medium|large-v3")
    ap.add_argument("--language", default="es")
    ap.add_argument("--output-dir", default="captions")
    args = ap.parse_args()

    from faster_whisper import WhisperModel

    src = Path(args.input)
    files = [src] if src.is_file() else sorted(
        p for p in src.rglob("*") if p.suffix.lower() in FORMATS
    )
    if not files:
        print(f"no audio files in {src}", file=sys.stderr)
        return 1

    outdir = Path(args.output_dir)
    outdir.mkdir(parents=True, exist_ok=True)
    model = WhisperModel(args.model, device="cpu", compute_type="int8")
    for audio in files:
        segments, info = model.transcribe(
            str(audio), language=args.language, word_timestamps=True
        )
        segments = list(segments)  # materialize: the generator can only be consumed once
        dest = outdir / (audio.stem + ".srt")
        to_srt(segments, dest)
        wdest = outdir / (audio.stem + ".words.json")
        to_words_json(segments, wdest)
        print(f"OK {audio} (lang={info.language} p={info.language_probability:.2f}) -> {dest} + {wdest}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
