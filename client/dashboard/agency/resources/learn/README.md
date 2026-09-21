# Resource library design prototype

The Library currently renders `sample-resource-grid.tsx` in place of the live
resource center. The `/resources/learn` route stays the same; `?resource=sample-XX`
opens a shareable preview. This is a design-review implementation, not a completed
migration of the agency resources API or its engagement tracking.

## Review map

- `sample-resource-grid.tsx`: DataViews search, filters, stage picker, cards, and URL navigation.
- `use-resource-load-more.ts`: reveal resources in batches of 24 near the bottom, with a manual Load more fallback.
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

Scroll through the grid to load batches of 24 resources, or use Load more.
Changing search, filters, or stage resets the batch; opening a preview pauses
automatic loading. Manual loading focuses the first newly added card.

Check search and combined filters, tags in cards and previews, direct links,
Escape/arrow-key navigation, downloads, and PDF page thumbnails. At 600px and
below the modal fills the viewport. The toolbar responds to its available
container width, including when the sidebar is present. Motion respects the
reduced-motion preference.

## Card design

Cards use stylized titles with vibrant product-brand colors and signature logos.
The compact modal keeps a neutral header with a product-colored logo above its
title, a Download / Copy link toolbar, and default badges. Download works for
both PDF fixtures and the sample video.
