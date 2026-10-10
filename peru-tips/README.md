# 4 tips para vender winners en Perú — edición de 1 minuto

Video HyperFrames de **60 segundos** en formato horizontal **1280 × 720 a 30 fps**, armado con el material de `assets/clip-base.mp4`.

## Criterio de edición

Se replica el estilo del video de referencia (`replica de edicion.mp4`): plano horizontal continuo, una sola pieza de 1 minuto, sin transiciones llamativas ni rótulos agregados.

- **Capas:** el mismo clip base se usa como fondo a pantalla completa (desenfocado y atenuado) y como clip vertical centrado que conserva los rótulos y subtítulos originales.
- **Audio:** se mantiene el audio original del clip base, en una sola pista.
- **Duración:** 60 s exactos, recortando los 0,578 s finales del material fuente.

## Render

Requisitos: Node.js 22 o superior y FFmpeg.

```powershell
npm install
npm run verify
npm run render
```

El MP4 se escribe en `renders/peru-tips-1min.mp4`.

## Render en la nube

El workflow `.github/workflows/render-peru-tips.yml` renderiza en GitHub Actions y publica el resultado como artifact `peru-tips-1min`.
