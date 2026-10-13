# QA and acceptance checklist

## Functional

- [ ] Moving a mouse or trackpad pointer reveals the weave.
- [ ] The reveal follows as a widening wake rather than a circular cursor halo.
- [ ] The broader reveal remains soft at its edges and does not feel like a blob.
- [ ] The wake remains continuous with no group-by-group popping.
- [ ] The reveal fades completely after pointer movement stops.
- [ ] Links, buttons, text selection, and other page interactions still work.
- [ ] Touch scrolling is unaffected.

## Visual

- [ ] Only one SVG copy appears in each wrapped section.
- [ ] No repeated-image boundary or seam is visible.
- [ ] The centered cover crop remains stable when the section resizes.
- [ ] Hover remains smooth after the first pattern render.
- [ ] Pattern color is Atomic Finds green `#3a5e52`.
- [ ] The wake's leading edge has a subtle rust `#c25b22` shimmer.
- [ ] The amber highlight brightens the vectors without obscuring the weave.
- [ ] Pattern density and scale remain consistent at common desktop widths.
- [ ] The canvas reaches every edge of its wrapper.
- [ ] Child content remains above the decorative canvas.

## Responsive and accessibility

- [ ] Test at 320, 768, 1024, and 1440 CSS pixels wide.
- [ ] Test short, square, and tall sections to confirm cover scaling.
- [ ] Test at device pixel ratios 1 and 2.
- [ ] Resize the window and confirm the cached pattern redraws correctly.
- [ ] With reduced motion enabled, the reveal canvas is hidden.
- [ ] The decorative canvas is absent from the accessibility tree.
- [ ] Keyboard focus styling and tab order are unchanged.

## Integration failures

If no pattern appears:

1. Open `/weave-pattern.svg` directly and confirm it returns HTTP 200.
2. Confirm the SVG is served from the same origin as the page.
3. Confirm the wrapper has a non-zero width and height.
4. Confirm no opaque child background is covering the canvas.
