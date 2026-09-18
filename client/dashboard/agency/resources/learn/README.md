# Resource library design prototype

The Library currently renders `sample-resource-grid.tsx` in place of the live
resource center. The `/resources/learn` route stays the same; `?resource=sample-XX`
opens a shareable preview. This is a design-review implementation, not a completed
migration of the agency resources API or its engagement tracking.

## Review map

- `sample-resource-grid.tsx`: DataViews search, filters, stage picker, cards, and URL navigation.
- `resource-preview.tsx`: responsive modal, copy/download actions, PDF pages, and resource navigation.
- `resource-tags.tsx`: clickable card tags with horizontal scrolling and hover return.
- `resource-thumbnail.tsx` and `sample-resource-grid.scss`: format illustrations, motion, and responsive styling.
- `sample-resources.ts`: 64 illustrative entries. Videos share an external CC0 demonstration clip.
- `sample-documents.ts` and `sample-assets/`: 48 actual sample PDFs and their rendered page images, bundled by Webpack for local and review builds. These are product fixtures, not PR screenshots.

The original `resource-center.tsx` remains available for the eventual API integration.
Resource contents and newly introduced copy still need editorial/localization review.

## Try it

Run `yarn start-dashboard` and open `http://my.a4a.localhost:3000/resources/learn`
with an agency account that can access Resources. Try `sample-01` (guide),
`sample-03` (checklist), `sample-04` (deck), and `sample-05` (one-pager).

Check search and combined filters, tags in cards and previews, direct links,
Escape/arrow-key navigation, downloads, and PDF page thumbnails. At 600px and
below the modal fills the viewport. The toolbar responds to its available
container width, including when the sidebar is present. Motion respects the
reduced-motion preference.

## Card design defaults

The default view uses **Stylized titles**, **Product** color treatment,
**Product brand** palette, **Vibrant** intensity, and **Signature** logos.
The compact modal keeps a neutral header with a product-colored logo above its
title, a Download / Copy link toolbar, and default badges. Download works for
both PDF fixtures and the sample video.

The temporary design panel is hidden by default. Add `?designTools=true` to the
Library URL to compare the featured-image design, palettes, intensity, and logo
placements. These controls only update local component state and reset on reload.
They are retained for this design-review draft and should be removed before
production integration.
