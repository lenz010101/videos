---
workflow: general-video
flow: automation
storyboard: no
message: "El carrito gastronómico se ve premium: color que abre el apetito, movimiento con intención y marca clara"
destination: reels
aspect: 1080x1920
language: es
length: 55.4s
---

## Intent

Rehacer la estética de un video vertical de celular (55.4 s) de un carrito de
hamburguesas y hot dogs en la calle. El material original es plano y con look
de teléfono; el objetivo es que se sienta premium y apetitoso sin cambiar el
contenido ni los subtítulos ya quemados. Tono street-food, directo y cálido.

## Assets

- assets/source.mp4 — footage original 478x850 60fps con subtítulos quemados; es el plano base a pantalla completa.
- assets/fonts/ — Anton + Inter embebidas en local (@font-face).

## Customizations

- Color grading: look `food-pop` **horneado en píxeles con FFmpeg** en build (eq + colorbalance).
  No usa el shader de runtime `data-color-grading`: medido en el runner, ese shader cuesta
  28.664 ms/frame sobre GL por software, contra 66 ms/frame sin él (~450x). Mismo look, render viable.
- Reframing: empuje lento continuo + deriva sutil (zoom/pan sobre un wrapper no temporizado).
- Overlays de marca: lockup superior (nombre + handle) en glassmorphism y píldora CTA inferior, paleta rojo fuego + amarillo.
- Riel de progreso inferior animado.

## Notes

- Los subtítulos originales NO se tocan: vienen quemados en el video.
- Los overlays se ubican arriba y abajo para no tapar la zona de subtítulos (~70–83% de la altura).
- Marca en placeholder ("Tu Marca" / "@tumarca") — editar luego.
- Render en nube vía GitHub Actions; nada se procesa local.
