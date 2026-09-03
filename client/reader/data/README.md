# Reader data integrations

How to add data fetching to the Reader. The Redux→React Query migration ([recap](https://loopp2.wordpress.com/2026/06/04/reader-query-migration-moving-server-state-from-redux-to-react-query/)) is largely complete; new Reader data fetching follows a three-layer pattern — **never** add Redux data-layer handlers, reducers, or `QueryReader*` components.

```
packages/api-core      →  fetchers/mutators: one pure function per endpoint (no React, no cache)
packages/api-queries   →  queryOptions()/mutationOptions(): query keys, normalization, cache rules
client/reader/data/…   →  consumer hooks: thin wrappers over useQuery/useMutation for Reader UI
```

Dependencies flow one way: `api-queries` imports from `api-core`, and consumer hooks import from `api-queries` — never the reverse. Reader components import from the wrapper (or `@automattic/api-queries` directly for one-off reads); they never call `wpcom.req` or `fetch`.

The examples below trace two real, correctly-located domains: **sites** (a simple read) and **lists** (mutations).

## 1. Fetcher / mutator (`packages/api-core/src/read-<name>/`)

A pure function that performs the HTTP call. Always import `wpcom` from `../wpcom-fetcher` — never call `wpcom-proxy-request` or `fetch` directly. `encodeURIComponent` any value interpolated into the path.

```ts
// packages/api-core/src/read-sites/fetchers.ts
import { addQueryArgs } from '@wordpress/url';
import { wpcom } from '../wpcom-fetcher';
import type { ReadSiteResponse } from './types';

// Field-selection lists, trimmed here for brevity; the real module sends the full set.
const fields = [ 'ID', 'name', 'URL', 'subscription' ].join( ',' );

export const fetchReadSite = ( siteId: number ): Promise< ReadSiteResponse > =>
	wpcom.req.get( {
		path: addQueryArgs( `/read/sites/${ siteId }`, { fields } ),
		apiVersion: '1.1',
		method: 'GET',
	} );
```

Mutators (POST/DELETE) live in `mutators.ts` next to the fetchers — e.g. `followReadList` / `deleteReadList` in `packages/api-core/src/read-lists/mutators.ts`.

Files per module: `fetchers.ts`, `mutators.ts`, `types.ts`, `index.ts` (barrel). Then re-export the module from `packages/api-core/src/index.ts`.

## 2. Query / mutation options (`packages/api-queries/src/read-<name>.ts`)

Wrap the fetcher in `queryOptions()`. Response→domain normalization belongs in `select` (keeps components free of API shapes). Re-export from `packages/api-queries/src/index.ts`.

```ts
// packages/api-queries/src/read-site.ts
export const readSiteQuery = ( siteId?: number | string ) => {
	const coerced = typeof siteId === 'string' ? Number( siteId ) : siteId;
	const id = typeof coerced === 'number' && Number.isFinite( coerced ) ? coerced : undefined;

	return queryOptions( {
		queryKey: [ 'read', 'sites', id ?? 'invalid' ],
		queryFn: () => fetchReadSite( id! ),
		select: adaptReadSite, // response → domain shape
		staleTime: ONE_DAY_MS,
		enabled: typeof id === 'number' && id > 0,
	} );
};
```

- **Query key**: always prefixed `[ 'read', '<domain>', …params ]`. The prefix lets mutations invalidate a whole domain in one call.
- **`staleTime`**: scale to the data's change-rate — slowly-changing entities like a site can sit at a day (`readSiteQuery` uses `ONE_DAY_MS`); data with external change events (payments, server-side mutations) wants ~1 min. Confirm with backend when unsure.
- **`enabled`**: set it whenever a param can be null/empty so the query doesn't fire with `undefined`.
- **Pagination**: use `useInfiniteQuery` with a `getNextPageParam` derived from the API's real contract (page caps, `total` counts) — not assumed page sizes. See `read-follows.ts`.

**Mutation factories must accept the consumer's `QueryClient`** — Calypso boots its own client, so a factory that closes over the singleton invalidates the wrong cache. See [the rule in AGENTS.md](../AGENTS.md#mutation-factories-must-accept-the-consumers-queryclient). Cache-touching side effects go in `onSuccess`; user-facing side effects (notices, navigation) stay in the _consumer_, not here.

```ts
// packages/api-queries/src/read-lists.ts
export const followReadListMutation = ( queryClient: QueryClient ) =>
	mutationOptions( {
		mutationFn: ( { owner, slug }: { owner: string; slug: string } ) =>
			followReadList( owner, slug ),
		onSuccess: () => invalidateSubscribedLists( queryClient ),
	} );
```

## 3. Consumer hook (`client/reader/data/<domain>/`)

**Not every read needs a wrapper.** For a simple, one-off access just call the query options directly in the component — no hook to add:

```tsx
const { data: site } = useQuery( readSiteQuery( siteId ) );
```

Reach for a custom hook under `client/reader/data/<domain>/` once there is logic to share or hide behind the call: injecting Redux selectors (locale/login), normalizing or deriving values, passing `useQueryClient()` into a mutation factory, optimistic cache patching, or several components composing the same query the same way. In short — **direct query for simple reads, a consumer hook for anything reused or non-trivial (especially mutations).**

The hook is a thin adapter — it keeps API-shape knowledge out of components. Export it from a per-domain barrel (`client/reader/data/<domain>/index.ts`).

```tsx
// client/reader/data/site/use-site.ts
export function useSite( siteId: number | string | undefined ) {
	return useQuery( readSiteQuery( siteId ) );
}
```

> The real `useSite` also dispatches `READER_SITE_RECEIVE` to keep legacy Redux reducers in sync — an optional bridge you only need when older Redux consumers still read the same data. New domains without that legacy don't.

For mutations, the consumer passes its `QueryClient` into the factory and owns the user-facing effects:

```tsx
const queryClient = useQueryClient();
const followList = useMutation( followReadListMutation( queryClient ) );
// success notice / navigation live here, in the consumer's onSuccess — not in the factory
```

For a real consumer that wraps a mutation factory and adds the success notice, see `useFollowSite` in `client/reader/data/site-subscriptions/use-follow-mutations.ts`. Infinite lists wrap `useInfiniteQuery` and expose flattened data plus pagination helpers — see `client/reader/data/site-subscriptions/use-site-subscriptions.ts`.

## Conventions checklist

| Kind             | Pattern                           | Example                   |
| ---------------- | --------------------------------- | ------------------------- |
| Fetcher          | `fetchRead<Name>`                 | `fetchReadSite`           |
| Mutator          | `<verb>Read<Name>`                | `followReadList`          |
| Query factory    | `read<Name>Query`                 | `readSiteQuery`           |
| Mutation factory | `<verb>Read<Name>Mutation`        | `followReadListMutation`  |
| Response types   | `Read<Name>Response`              | `ReadSiteResponse`        |
| Query key        | `[ 'read', '<domain>', …params ]` | `[ 'read', 'sites', id ]` |

- Prefer the `Read` prefix on every symbol (`fetchReadSite`, `ReadSiteResponse`). A few older domains omit it (`followSite` in site-subscriptions) — don't copy that for new code.
- New files are `.ts`/`.tsx` — never `.jsx`.
- Update **both** barrels (`api-core/src/index.ts` and `api-queries/src/index.ts`).
- Tests use `nock` for HTTP and `renderWithProvider` for Redux-dependent components. nock URL: `https://public-api.wordpress.com/rest/v<apiVersion>/<path>` for `wpcom.req` calls.
- Logged-out subscription-management endpoints (`/read/sites/{id}/subscription-details`, etc.) need an `X-WPSUBKEY` fallback. The `client/lib/request-with-subkey-fallback/` helper shows the pattern — inline that logic in the fetcher rather than importing the helper into `api-core` (wrong dependency direction).

## Reference implementations

- **Simple read**: `read-sites` (`api-core/src/read-sites/`, `api-queries/src/read-site.ts`, consumer `client/reader/data/site/use-site.ts`).
- **Mutations with the injected `QueryClient`**: `read-lists` (`api-queries/src/read-lists.ts`) — every mutation factory takes the caller's `QueryClient`.
- **Infinite list + follow/unfollow + optimistic updates**: `read-follows` (`api-queries/src/read-follows.ts`, consumer `client/reader/data/site-subscriptions/`).
- **Optimistic cache surgery**: `client/reader/data/recommended-sites/` (`useDismissRecommendedSite`).

## Related docs

- [`post/README.md`](./post/README.md) — Reader post reads (`usePost()`, cache-only reads, `usePostQuery()`).
- [`stream/README.md`](./stream/README.md) — stream data.
- [`../AGENTS.md`](../AGENTS.md) — Reader architecture decisions and coding boundaries.
