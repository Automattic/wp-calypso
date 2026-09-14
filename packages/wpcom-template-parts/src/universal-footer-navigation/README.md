# Universal footer navigation

React twin of the WPCOM marketing-site footer rendered by the `wpcom-global-nav`
plugin (`wp-content/a8c-plugins/wpcom-global-nav/` in the WPCOM codebase). Keep
it in sync with that twin by hand, the same way the header twin is kept in sync
(see `../universal-header-navigation/nav-2026/taxonomy.ts`).

## What is vendored, and from where

- **`style.scss`** — machine-extracted from the twin's Landpack stylesheet
  bundle. Source: the first `/_static/??-…` stylesheet linked by a logged-out
  render of a WPCOM marketing page (extracted from `https://wordpress.com/pricing/`
  in September 2026; the concat URL changes per deploy, so re-fetch the page and
  take its first `rel='stylesheet'` link).
- **`svgs.tsx`** — the eleven SVGs lifted verbatim from the same page's rendered
  footer markup (the two identical chevrons were deduped into `ChevronSvg`).
- **`taxonomy.ts`** — the link columns, transcribed from the rendered markup with
  labels wrapped in `__()` and wordpress.com URLs wrapped in `localizeUrl()`.

## Regeneration procedure (style.scss)

`style.scss` is generated output — **do not hand-edit it**; regenerate and
re-diff instead:

1. Fetch a logged-out WPCOM marketing page and save its footer subtree
   (`<section class="wpcom-global-nav-footer …">`) and its first linked
   stylesheet bundle.
2. Collect the set of class names used in the footer subtree.
3. Keep every rule from the bundle whose selector is (a) composed of classes
   entirely within that set (compounds mixing in unknown classes are dropped —
   they belong to Landpack page templates, not the footer), or (b) a bare
   element/universal selector (the Landpack base layer), or (c) an
   `[class^=…]`/`[class*=…]` attribute selector combined with known classes.
4. From `:root`/`html`/`body` rules, keep only custom properties transitively
   referenced by the kept rules, preserving their per-media-query
   redefinitions (the spacing scale changes per breakpoint).
5. Keep only the `inter-web` `@font-face` blocks actually referenced (normal
   style, weights 400/500/600/700), and absolutize their `/i/fonts/…` URLs to
   `https://wordpress.com/i/fonts/…`.
6. Prefix every selector with `.wpcom-global-nav-footer ` (the component wraps
   the twin's markup in a plain scope div, so descendant-only scoping via
   `:is()` suffices) and preserve the bundle's source order — the twin's
   cascade depends on it. Trailing pseudo-elements must be emitted **outside**
   the `:is()` wrap (`:is(.foo):after`, never `:is(.foo:after)`) — pseudo-
   elements are invalid inside `:is()` and browsers drop the whole rule.

Two things the scoping cannot contain: the `@font-face` blocks register
`inter-web` globally (font faces cannot be scoped), and font files load from
`wordpress.com` (CORS-open; verified `Access-Control-Allow-Origin: *`).

## Contracts worth knowing

- The empty `<li class="lp-block x-nav-footer--ccpa-dnsd">` in the Company
  column is the anchor point the twin's do-not-sell script fills. In Calypso,
  fill it via the `additionalCompanyLinks` prop (see `FooterProps` in
  `../types.ts`) — the planned Do Not Sell link belongs there.
- `data-is-ccpa-dnsd="1"` on the California privacy-notice link is likewise a
  hook the twin's script keys off.
- The language list (order, subset, English last) mirrors the twin's picker;
  the test asserts the labels against `@automattic/languages` to catch drift.
