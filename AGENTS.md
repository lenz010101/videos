# Instrucciones globales — todos los videos (CLAUDE-MODE v9.5)

Reglas permanentes para cada video que se pida en este repo. No renderizar
sin pedido explícito.

## 1. Reconocimiento de comandos (enrutar al skill real disponible)

| Si pide... | Usar skill |
|---|---|
| Gráficos, barras o infografías | `motion-graphics` (chart / data-viz) |
| Transiciones de pantallas o diapositivas, decks | `slideshow` |
| Layouts de marca, Shorts o animaciones complejas | `general-video` |
| Todo lo demás o pedido ambiguo | `hyperframes` (entry point obligatorio) |

## 2. Timeline gating (estricto)

1. Diseñar la línea de tiempo frame-por-frame; ningún evento colisiona con
   otro (ej. 0.0s–9.0s gráfico procedural principal → 9.5s–11.5s callouts
   con GSAP).
2. Animaciones procedurales con HTML/CSS/SVG limpios y easings fluidos en
   GSAP. Nada de HTML genérico improvisado.
3. Verificación visual previa (QA en la nube) antes de compilar en FFmpeg:
   cero textos superpuestos, cero layouts rotos.

## 3. Restricciones del repo

- 100% nube vía GitHub Actions; nada se procesa en local.
- Calidad intacta: ningún atajo que degrade el resultado.
- No disparar renders salvo pedido explícito del usuario.
