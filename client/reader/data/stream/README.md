# Reader Stream Data

This module is the Reader stream data boundary. Consumers should import stream hooks,
types, cache helpers, and prefetch helpers from `calypso/reader/data/stream` instead of
importing the implementation files directly.

## Responsibilities

- Fetch stream pages with React Query.
- Normalize API stream responses into stream item identity lists.
- Sync post bodies from stream responses into the canonical Reader post cache.
- Keep stream-local cache helpers, such as local removals and stream item lookup, in one place.
- Expose shared stream item types for UI surfaces that render stream-backed lists.

Post body data does not live in the stream cache long term. Stream queries own ordering,
pagination, and item identity. Post bodies should be read from `calypso/reader/data/post-cache`
after stream responses are synced through this module.

## Public API

Use `useInfiniteStream` for cursor-based Reader streams rendered by `<Stream>`:

```ts
const stream = useInfiniteStream( {
	streamKey: 'following',
	feedId,
	localeSlug,
	startDate,
} );
```

Use `usePaginatedStream` for page/per-page surfaces, currently Recent and On This Day:

```ts
const stream = usePaginatedStream( {
	streamKey: 'recent',
	page: 1,
	perPage: 15,
} );
```

Use `prefetchInfiniteStream` only when a UI intentionally warms the same infinite-stream cache
that `<Stream>` will read. Do not prefetch a different query key for a Stream preview.

Use cache helpers through this module:

- `getCachedStreamItems` reads item identity from cached infinite stream pages.
- `removeStreamItemFromCache` removes an item from matching cached infinite stream pages.
- `invalidatePaginatedStream` invalidates paginated stream query variants for a stream key.

## Types

- `StreamItem`: canonical stream item identity used by infinite streams.
- `StreamListItem`: `StreamItem | PaddingStreamItem`, used by paginated UIs that need placeholder rows for unfetched pages.
- `PostKey`: compatibility alias for `StreamItem` while older Reader code still uses post-key terminology.

Prefer these shared types instead of defining local `Post` or padding-item shapes in stream-backed UIs.
