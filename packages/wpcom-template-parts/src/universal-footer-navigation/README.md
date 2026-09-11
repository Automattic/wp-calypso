# Universal footer navigation

React twin of the WPCOM marketing footer. `style.scss` is generated output;
never hand-edit it, taxonomy, markup, or the feature flag as part of styling
regeneration.

## What is vendored

- **`style.scss`** — the immutable legacy footer stylesheet plus a mechanically
  generated, positively gated 2026 preview append.
- **`svgs.tsx`** — rendered WPCOM footer SVGs lifted verbatim; retain their
  provenance independently of stylesheet regeneration.
- **`taxonomy.ts`** — footer link columns transcribed from rendered markup,
  with labels wrapped in `__()` and wordpress.com URLs in `localizeUrl()`.
  Stylesheet regeneration never changes this taxonomy.

## Provenance and immutable legacy prefix

The beginning of `style.scss` is the byte-for-byte legacy footer stylesheet
from this immutable Calypso blob:

```
fe0d18488f7a9d3ec0c548d5fb80267b6141f11d:packages/wpcom-template-parts/src/universal-footer-navigation/style.scss
SHA-256 5c83ffd668cff7401af1e2925087fb94a41230baca8c8e0b73a4775da4474f15
```

The generated preview section is appended after that exact prefix. It must be
positively gated by `.wpcom-global-nav-footer--2026`; flag-off selectors and
their source order stay in the immutable prefix. Never use the current target
file as the next legacy input: that would append a preview section repeatedly.

## Accepted inputs required before regeneration

Regeneration is blocked until an independent manifest says `accepted: true`
and records SHA-256 hashes for all of these saved served artifacts:

- standalone `footer-style.css` and `footer-style.rtl.css`;
- general `style.css`, used only to retain the font faces referenced by the
  standalone footer font stack;
- exact legacy-off, white, and dark WPCOM footer subtrees; and
- exact Calypso wrapper markup: outer `.wpcom-global-nav-footer` with child
  `section.lp-footer-section`.

The independent validator accepted these seven inputs on 2026-09-11
(`accepted: true`; the CSS inputs are the served build after the Figma
type-ramp, spacing and hover fixes, and the HTML subtrees were re-captured
from the served `/hosting/` page with the same class set as the 2026-09-08
acceptance). This is input-only acceptance: it does not accept generated
Calypso output, editor behavior, deployment, RTL production, or the full
project. Do not substitute provisional or locally generated hashes for these
values:

| Manifest key | Accepted SHA-256 |
| --- | --- |
| `css` | `8541e751af97a13cdb73fe82bcf9e458bf3891885dcaaefcacb923ef7e02fb0d` |
| `rtlCss` | `1283e555fc727ebdf10cad0c3daf5a15de4dddf1343791556e8512f00b0d530d` |
| `fontCss` | `2ff3fe8c46bcc8d1f60569d0c1a3168f7a2398f62773cd42c1966ab587d9ab86` |
| `legacyHtml` | `c10ded71fbf6a9402841e28bf7a89eb91ab49b6ad8e5b23f21e2b0c2cd960a26` |
| `whiteHtml` | `84800c7d868d3d1df3f2cfcb1569fa5740dd68469086ee13c111ea39c551ad54` |
| `darkHtml` | `e435c0f83e37a1a556e538b8c05353bf7ecff57c1ee3d29123622743c71cc279` |
| `calypsoHtml` | `18025b77dcf3233ef9ac165d0c71516e1e7bea2223a08c7cb365d284b73545e7` |

The manifest remains caller-provided at `$ACCEPTED/manifest.json`; the durable
command below takes all seven artifact paths explicitly. A manifest is JSON
with this shape; every listed SHA-256 is the hash of the saved served artifact:

```json
{
  "accepted": true,
  "inputs": {
    "css": { "sha256": "<served footer-style.css SHA-256>" },
    "rtlCss": { "sha256": "<served footer-style.rtl.css SHA-256>" },
    "fontCss": { "sha256": "<served style.css SHA-256>" },
    "legacyHtml": { "sha256": "<served legacy-off footer HTML SHA-256>" },
    "whiteHtml": { "sha256": "<served white footer HTML SHA-256>" },
    "darkHtml": { "sha256": "<served dark footer HTML SHA-256>" },
    "calypsoHtml": { "sha256": "<saved Calypso wrapper HTML SHA-256>" }
  }
}
```

The independently controlled CLI run with generator `cb97bcdaf017f9969a3e1cd3e60edf4fa77b794ce82ec0f6758ba33fe55b0a10`
produced these reproducibility checkpoints:

- expected output SHA-256: `231138e076c87d4a9bf9386823279f790553c857e1a11c8b0524c14d48fe2ad6`;
- expected preview-append SHA-256: `e7400bfb3909442569ec9767caeb9e07483adf627b4bf593e52c0ab0b61bfc92`.

These hashes document the controlled generation result only. They do not
accept generated Calypso output or replace downstream RTL, off-mode, and live
composition review.

The class union is legacy-off + white + dark. The extractor preserves matched
rule order, media/supports nesting, and supported transitive custom-property
rules. It rejects IDs, unknown classes, unsupported attributes, keyframe steps,
and ancestor-qualified variable rules it cannot map safely. Those cases fail
generation rather than being guessed. Global variable selectors map to the
footer root; root compound/pseudo/colorway selectors map to the Calypso
outer-wrapper/section topology.

`footer-style.rtl.css` is an accepted, hash-verified comparison input only; the
generator does not emit RTL CSS from it. Run the Calypso production RTL build
and visual/property checks as a downstream verification step.

Only normal `inter-variable-web` is appended for preview. Legacy static
`inter-web` 400/500/600/700 remains in the immutable prefix. `@font-face` is
global, but it is lazy-loaded: off mode must prove no variable-font request and
the saved platform-font baseline must remain static Inter (or Arabic fallback).

## Mechanical composition contract

1. Materialize the legacy input with `git show` from the pinned commit above;
   hash it and reject any other bytes.
2. Read and hash every accepted manifest input; verify those hashes before
   extracting CSS or writing output.
3. Extract the union CSS by selector AST; preserve source order and at-rule
   nesting. Do not hand-select declarations.
4. Remove static `inter-web` faces from the preview append and retain only
   normal `inter-variable-web`. Preserve an existing direct positive 2026
   marker; otherwise add `:where(.wpcom-global-nav-footer--2026)` to the first
   Calypso root compound. This requires preview mode without raising selector
   specificity. Fail if the root is absent or negates the marker.
5. Write the exact legacy bytes, then the generated preview append. Emit a
   provenance JSON with legacy commit/hash, every accepted input hash, preview
   append hash, and final output hash.
6. Run the downstream Calypso production RTL build and compare off/white/dark
   properties against exact markup. Off must retain legacy
   properties/geometry/fonts; preview must use the accepted colorways.

## Reproducible command shape

```sh
CALYPSO_ROOT=/path/to/wp-calypso
WORK=/path/to/a-writable-temporary-directory
ACCEPTED=/path/to/the-independent-accepted-input-directory

git -C "$CALYPSO_ROOT" show fe0d18488f7a9d3ec0c548d5fb80267b6141f11d:packages/wpcom-template-parts/src/universal-footer-navigation/style.scss > "$WORK/legacy-pr1-style.scss"
shasum -a 256 "$WORK/legacy-pr1-style.scss"
node "$CALYPSO_ROOT/packages/wpcom-template-parts/bin/generate-footer-style.mjs" \
  --acceptance-manifest "$ACCEPTED/manifest.json" \
  --css "$ACCEPTED/footer-style.css" \
  --rtl-css "$ACCEPTED/footer-style.rtl.css" \
  --font-css "$ACCEPTED/style.css" \
  --legacy-html "$ACCEPTED/footer-off.html" \
  --white-html "$ACCEPTED/footer-white.html" \
  --dark-html "$ACCEPTED/footer-dark.html" \
  --calypso-html "$ACCEPTED/calypso-footer.html" \
  --module-root "$CALYPSO_ROOT" \
  --legacy-scss "$WORK/legacy-pr1-style.scss" \
  --legacy-commit fe0d18488f7a9d3ec0c548d5fb80267b6141f11d \
  --provenance-out "$WORK/global-footer-2026-provenance.json" \
  --out "$CALYPSO_ROOT/packages/wpcom-template-parts/src/universal-footer-navigation/style.scss"
```

## Contracts worth knowing

- The empty `<li class="lp-block x-nav-footer--ccpa-dnsd">` remains the
  Company-column insertion point for the do-not-sell link. In Calypso, supply
  that link with `additionalCompanyLinks` in `FooterProps` (`../types.ts`).
- `data-is-ccpa-dnsd="1"` on the California privacy-notice link remains a
  hook for the twin's do-not-sell behavior.
- The language picker’s order, subset, and English-last convention mirror the
  twin. Its labels are asserted against `@automattic/languages`.
