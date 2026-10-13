# Atomic Finds ATX — Weave Reveal

Developer handoff package for the interactive rattan diamond background.

## Included files

```text
components/WeaveReveal.tsx  Client-side React wrapper
public/weave-pattern.svg    Original smooth weave artwork
styles/weave-reveal.css     Required layout and accessibility styles
QA.md                       Acceptance and regression checklist
```

## Requirements

- React 18 or newer
- A browser environment with Canvas, `ResizeObserver`, and Pointer Events
- No third-party runtime dependencies are required.

## Next.js installation

1. Copy `components/WeaveReveal.tsx` into the site's components directory.
2. Copy `public/weave-pattern.svg` into the site's `public` directory.
3. Add the contents of `styles/weave-reveal.css` to the global stylesheet, or
   import that stylesheet once from the root layout.
4. Wrap any page or section that should use the effect.

The component already includes `"use client"` and can be imported by either an
App Router server component or another client component.

```tsx
import WeaveReveal from "@/components/WeaveReveal";

export default function Home() {
  return (
    <WeaveReveal className="min-h-screen">
      <main>{/* Existing page content */}</main>
    </WeaveReveal>
  );
}
```

For a site hosted below a path prefix, pass the public asset URL explicitly:

```tsx
<WeaveReveal patternUrl="/atomic-finds/weave-pattern.svg">
  <Catalog />
</WeaveReveal>
```

## React/Vite installation

Copy the same files, place the SVG in `public`, and import the CSS from the app
entry point:

```tsx
import "./styles/weave-reveal.css";
```

The usage API is identical to the Next.js example.

## Component API

| Prop | Type | Default | Purpose |
| --- | --- | --- | --- |
| `children` | `ReactNode` | Required | Existing section or page content |
| `className` | `string` | `""` | Adds layout or sizing classes to the wrapper |
| `patternUrl` | `string` | `"/weave-pattern.svg"` | URL for the weave SVG |

## Implementation notes

- The canvas is decorative and marked `aria-hidden`.
- Pointer input passes through the canvas; links and buttons remain interactive.
- Touch pointers are ignored to avoid interfering with scrolling.
- The effect is disabled when `prefers-reduced-motion: reduce` is active.
- Device pixel ratio is capped at `2` to control canvas rendering cost.
- The corrected 1806 × 847 artwork is rendered once and centered with cover
  scaling across each wrapped section.
- The SVG is never repeated or layered, so there is no tile boundary or seam.
- The complete vector pattern is rasterized into an offscreen canvas only when
  it loads or resizes; each animation frame draws that cached layer once.
- The reveal is a continuous blurred wake; it does not snap to SVG groups.
- A broad amber-to-rust highlight illuminates the wake's leading edge.

## Artwork contract

The current artwork uses a `0 0 1806 847` viewBox and 1,689 vector paths. The
renderer treats it as one visual texture, so SVG group IDs are not required. Its
complexity is isolated from the animation loop by the cached pattern layer.

## Content layering

The wrapper owns the off-white `#faf6ee` background. Its canvas sits at layer
zero and children sit at layer one. Avoid placing an opaque full-size background
on the immediate child if the pattern should remain visible behind that content.

## Tunable constants

These constants are near the top of `WeaveReveal.tsx`:

- `TRAIL_LIFETIME`: fade duration in milliseconds
- Wake width, edge spread, blur, and rust opacity are located in `renderTrail`

Run the checklist in `QA.md` after changing the artwork or animation constants.
