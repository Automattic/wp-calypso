# Resource library design prototype

The Library currently renders `sample-resource-grid.tsx` in place of the live
resource center. The `/resources/learn` route stays the same; `?resource=sample-XX`
opens a shareable preview. This is a design-review implementation, not a completed
migration of the agency resources API or its engagement tracking.

## Review map

- `sample-resource-grid.tsx`: DataViews search, filters, stage picker, cards, and URL navigation.
- `use-resource-load-more.ts`: reveal resources in batches of 24 near the bottom, with a manual Load more fallback.
- `resource-recommendations.tsx` and `use-resource-carousel.ts`: recommendations with an explanatory heading, keyboard-accessible links, and directional controls. The prototype uses “Because you have Pressable sites” with five curated resources spanning Pressable, WooCommerce, Jetpack, and A4A, covering migrations, store launches, handoffs, backups, and checkout improvements. Recommendations are independent of grid search, stage, and filters. Opening a recommendation keeps modal navigation within the recommendation set. This is a mock scenario, not connected to the agency’s actual sites or a recommendation service.
- `resource-cover.tsx`: shared product typography and illustration, with descriptions and subtle type-specific patterns in recommendation cards.
- `resource-preview.tsx`: responsive modal, copy/download/external-link actions, webpage embeds, PDF pages, and resource navigation.
- `resource-webpage-preview.tsx`: iframe loading state and retry for stalled navigation.
- `resource-tags.tsx`: clickable card tags with horizontal scrolling and hover return.
- `resource-thumbnail.tsx` and `sample-resource-grid.scss`: content-type illustrations, motion, and responsive styling.
- `sample-resources.ts`: 65 illustrative entries. Videos share an external CC0 demonstration clip.
- `sample-documents.ts` and `sample-assets/`: 48 actual sample PDFs and their rendered page images, bundled by Webpack for local and review builds. These are product fixtures, not PR screenshots.

The original `resource-center.tsx` remains available for the eventual API integration.
Resource contents and newly introduced copy still need editorial/localization review.

## Try it

Run `yarn start-dashboard` and open `http://my.a4a.localhost:3000/resources/learn`
with an agency account that can access Resources. Try `sample-01` (guide),
`sample-03` (checklist), `sample-04` (deck), `sample-05` (one-pager), and `sample-65` (Pressable knowledge base webpage).

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

## Webpage resources

Resources with `format: 'Webpage'` render their `url` in a titled, sandboxed
iframe instead of the document/video viewer. Their primary action is Open in new
tab; Copy link still shares the Library resource URL. `contentType` describes what the resource is (Guide, Checklist, Slide deck, etc.);
`format` describes how it is delivered (PDF, Video, or Webpage). Cards, illustrations,
type tags, and the Content type filter use `contentType`. The preview and primary
action use `format`, which also has its own independent filter. For example,
`sample-01` and `sample-65` are both Guides, delivered as PDF and Webpage respectively.

Destination sites control whether they permit embedding through their response
headers. Blocked destinations cannot be reliably detected from the parent page;
the external-link action stays available. Pending navigation shows a loading state,
with Retry preview after eight seconds; the initial `about:blank` load is ignored. Do not proxy pages to bypass embedding
restrictions. Test iframe scrolling, links, keyboard entry/exit, and the outbound
action alongside the existing PDF/video previews.
