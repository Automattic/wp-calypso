# Reader Post Data

Reader post state is moving from `state.reader.posts` to React Query. During the
migration, the Reader has two post access layers with different contracts:

- `useReaderPost( postKey )` is the UI-facing, request-capable hook. It returns a
  React Query result shape and resolves `data` from the canonical post cache
  first, then fetches the full post when the cache is missing, minimal, or lacks
  renderable content. New post detail UIs should prefer this hook.
- `useCachedReaderPost( postKey )` and `useCachedReaderPosts( postKeys )` are
  cache-only reads. They never fetch. Use them for stream/list/card contexts
  where firing one full-post request per item would create a request waterfall,
  or for small action surfaces that only need the post already supplied by the
  stream.

The canonical cache lives in `reader-post-cache.ts`. Stream responses, full post
fetches, and optimistic updates write into this cache through
`reader-post-cache-sync.ts`. The cache query keys are memory-only and are not
persisted to localStorage.

`reader-post-cache-middleware.ts` only mirrors legacy Redux actions that still
represent post-adjacent state, such as seen/unseen and conversation follow
updates. It does not receive or normalize post payloads. New Reader post
producers should call `syncReaderPostCache()` after fetching posts so cache-only
surfaces have the data they need before rendering.

## Migration Rules

- Do not add new `QueryReaderPost`-style data components. Function components
  should call `useReaderPost` directly.
- Use a HOC only when the consumer is a class component and cannot call hooks.
- Default to `useReaderPost` unless there is an explicit request-waterfall
  reason to stay cache-only.
- When choosing cache-only, make the reason obvious in the surrounding code or
  PR description.
- Like/comment/store-post mutations should update the canonical cache directly
  and invalidate/refetch the request-capable query when server state is needed.
