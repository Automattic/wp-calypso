# Resource library design prototype

The A4A Dashboard Library replaces the Learn screen at `/resources/learn`.
It uses an agency-facing snapshot from the resource hub, not the live resource
query. Shareable links use `?resource=hub-<id>`. Recommendations, stages, featured
status, and fallback descriptions remain local editorial choices. This is a
prototype, not a completed API or engagement-tracking migration.

## Review map

- `hub-resources.ts` normalizes `hub-resource-snapshot.json`, keeping content type separate from file format and preserving product associations.
- `sample-resource-grid.tsx` owns DataViews search, filters, stages, grid/list switching, selection, and the resource navigation source. The list uses a dedicated brand column and clickable rows.
- `resource-cover.tsx` supplies shared covers: light product colors for grid cards and vibrant recommendations. `resource-thumbnail.tsx` supplies the animated type illustrations.
- `resource-recommendations.tsx` and `use-resource-carousel.ts` provide an independent six-item carousel. The collapsible heading explains the mock recommendation scenario; only its closed state shows a count.
- `resource-preview.tsx` provides a compact stacked details modal. It centers on opening and retains that top position during navigation. Connected previous/next icon buttons and arrow keys navigate within the originating collection.
- `resource-detail-artwork.tsx` shows PDF first-page thumbnails, selected video stills, Google thumbnails, or webpage mshots. Loading uses a neutral animated illustration; errors retain a static illustration. Previews open externally, with a persistent play button for videos. Opening uses a slide-up transition; subsequent navigation fades. Reduced motion disables both.
- `resource-download.ts` resolves Drive file downloads, Google Docs/Slides PDF exports, Sheets XLSX exports, and direct file links. Destination permissions still apply.
- `resource-document-thumbnail.tsx` lazily renders first-page PDF thumbnails with PDF.js, serializes rendering, and caches up to 60 images.
- `use-resource-load-more.ts` reveals resources in batches of 24 with automatic loading and a keyboard-accessible fallback. Filtering resets the batch and opening a modal pauses loading.
- `bin/export-resource-illustrations.cjs` exports looping GIFs and MP4s of the type illustrations; output is kept outside the repository.

The original `resource-center.tsx` remains for eventual live API integration.
There are no embedded viewers, PDF paging controls, or temporary tweak panels.

## Try it

Run `yarn start-dashboard`, sign in with an agency account, and open
`http://my.a4a.localhost:3000/resources/learn`.

Check grid/list views, combined filters, tags, recommendation collapse and paging,
keyboard loading, and direct links. Open `hub-461` for a PDF and `hub-402` for a
video. Check downloads, Copy link, preview links, stable modal navigation, and
Escape. Check narrow widths, RTL direction, and reduced motion.

External thumbnails, mshots, PDF fetches, and exports may fail or require sign-in.
The open action remains available. Bundled video stills avoid generic first-frame
posters; they are preview assets, not video files. Real recommendations, live data,
editorial/localization review, and comprehensive accessibility/dark-mode review
remain required before production.
