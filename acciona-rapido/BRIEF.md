---
workflow: general-video
flow: automation
storyboard: no
message: "En e-commerce, acciona rápido: el negocio premia al más veloz"
destination: x-feed
aspect: 720x1280
language: es
length: 60s
angle: tip-recut
---

## Intent

Corto vertical de 60 segundos que replica la edición del video de referencia
("4 tips para vender winners en Perú"): barra de título superior, subtítulos
karaoke palabra por palabra, lista de pasos acumulativa arriba a la derecha,
tarjeta gancho inicial en negro y cortes a b-roll con el audio continuo.
El material es el consejo 3 ("acciona rápido") del clip base de Erick sobre
e-commerce. Tono directo y enérgico, igual que la referencia.

## Assets

- assets/segmento.mp4 — 57.5 s del clip base (6:32.52–7:30.02), 720p30, con audio original.
- assets/Montserrat-VF.ttf — fuente Montserrat variable (OFL), embebida con @font-face.
- assets/broll-*.mp4 — apoyos de internet (Wikimedia Commons) para los cortes.
- captions/clip-base.srt — transcripción nube (faster-whisper, GitHub Actions).

## Customizations

- Tarjeta gancho 0–2.5 s en negro: "El e-commerce premia al más veloz".
- Título superior persistente: "Acciona rápido en / e-commerce:".
- Lista acumulativa: 1. Busca productos al toque / 2. Tu landing al toque / 3. Lanza tu testeo.
- Render en HeyGen cloud (9:16, 30 fps, standard).

## Notes

- Todo el cómputo pesado en la nube (transcripción Actions, render HeyGen); en local solo preparación liviana.
- Sin GSAP ni red en render: motion solo con CSS animations (patrón del repo).
- No agregar música: se conserva el audio original como la referencia.
