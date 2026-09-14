import {
	addReadShelfSource,
	canonicalizeReadShelfSlug,
	createReadShelf,
	deleteReadShelf,
	deleteReadShelfSource,
	fetchReadShelf,
	fetchReadShelfBySlug,
	fetchReadShelves,
	isWpError,
	updateReadShelf,
	type ReadShelf,
	type ReadShelfDeletionResult,
	type ReadShelfDetails,
	type ReadShelfSourceMutationParams,
	type UpdateReadShelfParams,
} from '@automattic/api-core';
import {
	keepPreviousData,
	mutationOptions,
	queryOptions,
	type QueryClient,
} from '@tanstack/react-query';
import { getStreamInfiniteQueryKeyPrefix } from './read-streams';

const readShelvesListKey = [ 'read', 'shelves', 'list' ] as const;

const readShelfDetailKey = ( shelfId: string ) => [ 'read', 'shelves', 'detail', shelfId ] as const;

// Canonicalize the slug so callers that pass the encoded API slug (sidebar,
// mutations) and the one that passes the decoded route slug (the view) land on the
// same key. No-op for ASCII slugs.
const readShelfBySlugKey = ( slug: string ) =>
	[ 'read', 'shelves', 'detail-by-slug', canonicalizeReadShelfSlug( slug ) ] as const;

// A shelf drives two streams: the posts feed (`shelf:<id>`, built server-side
// from the shelf's followed feeds and tags) and Discover (`shelf_discover:<id>`,
// on-topic recommendations filtered by the shelf's languages). Editing the shelf
// — tags, feeds, or languages — changes which posts either stream returns, so
// both have to reload. Discover in particular is filtered by the shelf's
// languages, so a language change that leaves it cached would keep showing the
// old-language recommendations until the next hard reload.
//
// The streams are cursor-paginated `useInfiniteQuery`s, so a plain
// `invalidateQueries` is not enough: it refetches each cached page using the
// cursor (`before`/`offset`) it was originally loaded with, and those cursors
// were derived from the *old* post set. After the edit the page boundaries no
// longer line up, so the reloaded list can show stale, duplicated or gapped
// posts. `resetQueries` discards the cached pages and their cursors and refetches
// the active stream from the first page — a clean reload. This mirrors the stream
// "force refresh" pattern in `client/reader/stream/use-stream-pending-posts.ts`.
const reloadReadShelfStreams = ( queryClient: QueryClient, shelfId: string ) =>
	Promise.all( [
		queryClient.resetQueries( {
			queryKey: getStreamInfiniteQueryKeyPrefix( `shelf:${ shelfId }` ),
		} ),
		queryClient.resetQueries( {
			queryKey: getStreamInfiniteQueryKeyPrefix( `shelf_discover:${ shelfId }` ),
		} ),
	] );

export const readShelvesQuery = () =>
	queryOptions( {
		queryKey: readShelvesListKey,
		queryFn: () => fetchReadShelves(),
		// Every mutation returns the full detail and writes it back to these caches,
		// then invalidates them for a canonical refresh. Persisted data can render
		// immediately after reload while the active query refreshes in the background.
		staleTime: Infinity,
		refetchOnMount: 'always',
		placeholderData: keepPreviousData,
		meta: { persist: true },
	} );

const isClientError = ( error: unknown ): boolean =>
	isWpError( error ) && error.status >= 400 && error.status < 500;

export const readShelfQuery = ( shelfId: string ) =>
	queryOptions( {
		queryKey: readShelfDetailKey( shelfId ),
		queryFn: () => fetchReadShelf( shelfId ),
		staleTime: Infinity,
		refetchOnMount: 'always',
		// A 4xx is terminal (the shelf is gone or not the viewer's), so surface it
		// at once rather than backing off through TanStack's default three retries.
		// Calypso boots its own QueryClient without a retry default (unlike this
		// package's client), so gate it here.
		retry: ( failureCount, error ) => ! isClientError( error ) && failureCount < 3,
		// No `placeholderData: keepPreviousData` here: when `shelfId` changes the
		// detail view (or a still-mounted Sources modal) must not flash the previous
		// shelf's name/sources. The persisted cache + mount-time refetch already keep
		// the *same* shelf's data visible while it refreshes.
		meta: { persist: true },
	} );

// Read a shelf by its URL slug (`GET /reader/shelves/slug/{slug}`). Slug-addressed
// URLs resolve through this; the resolved detail carries the numeric `id` that
// streams and mutations use. Keyed by slug, so a rename (which changes the slug)
// lands on a fresh entry — the mutations below seed the new slug and drop the old.
// Same config as `readShelfQuery`: a 4xx (unknown/renamed-away/not-yours slug) is
// terminal, so surface it at once rather than retrying.
export const readShelfBySlugQuery = ( slug: string ) =>
	queryOptions( {
		queryKey: readShelfBySlugKey( slug ),
		queryFn: () => fetchReadShelfBySlug( slug ),
		staleTime: Infinity,
		refetchOnMount: 'always',
		retry: ( failureCount, error ) => ! isClientError( error ) && failureCount < 3,
		meta: { persist: true },
	} );

// The summary (list) shape is the detail minus its `sources`, `tags`, and
// `languages` (the detail-only fields).
const toSummary = ( shelf: ReadShelfDetails ): ReadShelf => {
	const { sources, tags, languages, ...summary } = shelf;
	return summary;
};

// Calypso boots its own QueryClient (see `client/state/query-client.ts`) instead
// of the singleton from this package, so each mutation factory accepts the
// caller's QueryClient and uses it to write the cache. Pass `useQueryClient()`
// from the consuming component.
//
// Every mutation returns the full updated detail, so we write that straight into
// the caches for an immediate UI update. We then invalidate the affected queries
// so active consumers refetch the canonical server state and inactive consumers
// refresh the next time they mount.

const invalidateReadShelvesList = ( queryClient: QueryClient ) =>
	queryClient.invalidateQueries( { queryKey: readShelvesQuery().queryKey } );

const invalidateReadShelfDetail = ( queryClient: QueryClient, shelfId: string ) =>
	queryClient.invalidateQueries( { queryKey: readShelfQuery( shelfId ).queryKey } );

const invalidateReadShelfListAndDetail = ( queryClient: QueryClient, shelfId: string ) =>
	Promise.all( [
		invalidateReadShelvesList( queryClient ),
		invalidateReadShelfDetail( queryClient, shelfId ),
	] ).then( () => undefined );

// Every mutation returns the full detail. Write it to both detail caches — the
// id-keyed one (streams, the Customize modal) and the slug-keyed one (how the
// shelf view resolves its URL) — so a slug-addressed view paints from cache the
// instant it lands, without a round-trip. A rename also seeds the *new* slug here,
// so redirecting to it after the save is seamless.
const setReadShelfDetailCaches = ( queryClient: QueryClient, shelf: ReadShelfDetails ) => {
	queryClient.setQueryData< ReadShelfDetails >( readShelfQuery( shelf.id ).queryKey, shelf );
	queryClient.setQueryData< ReadShelfDetails >(
		readShelfBySlugQuery( shelf.slug ).queryKey,
		shelf
	);
};

export const createReadShelfMutation = ( queryClient: QueryClient ) =>
	mutationOptions( {
		meta: { statId: 'read-shelf-create' },
		mutationFn: createReadShelf,
		onSuccess: ( shelf ) => {
			// Append the summary to the list and seed the detail cache so the sidebar
			// and the (just-opened) sources modal both reflect the new shelf at once.
			queryClient.setQueryData< ReadShelf[] >( readShelvesQuery().queryKey, ( previous ) => [
				...( previous ?? [] ),
				toSummary( shelf ),
			] );
			setReadShelfDetailCaches( queryClient, shelf );
			// Reconcile in the background — don't await the refetch so the consumer's
			// own onSuccess (close modal, redirect) fires immediately off the cache write.
			void invalidateReadShelfListAndDetail( queryClient, shelf.id );
		},
	} );

type UpdateReadShelfVariables = {
	shelfId: string;
	params: UpdateReadShelfParams;
};

export const updateReadShelfMutation = ( queryClient: QueryClient ) =>
	mutationOptions<
		ReadShelfDetails,
		unknown,
		UpdateReadShelfVariables,
		{ previousList: ReadShelf[] | undefined; previousSlug: string | undefined }
	>( {
		meta: { statId: 'read-shelf-update' },
		mutationFn: ( { shelfId, params } ) => updateReadShelf( shelfId, params ),
		// Optimistically patch the cached list summary so the sidebar — which reads
		// `useShelves()` (this list) and renders each item's icon and colour from
		// `layout` via `resolveShelfIconColor` — reflects a name/icon/colour change
		// the instant the user saves, without waiting for the round-trip. `onSuccess`
		// then writes the canonical server detail over the top.
		onMutate: async ( { shelfId, params } ) => {
			// `cancelQueries` is best-effort per the TanStack docs; if it rejects we
			// must still apply the optimistic write and let the mutationFn run.
			try {
				await queryClient.cancelQueries( { queryKey: readShelvesQuery().queryKey } );
			} catch {
				// no-op — fall through to the optimistic write below.
			}
			const previousList = queryClient.getQueryData< ReadShelf[] >( readShelvesQuery().queryKey );
			// The slug we're currently addressed by, captured before the rename so
			// `onSuccess` can drop its now-stale by-slug cache entry. Prefer the list, but
			// fall back to the id-keyed detail cache so eviction still happens when the
			// list query hasn't populated.
			const previousSlug =
				previousList?.find( ( item ) => item.id === shelfId )?.slug ??
				queryClient.getQueryData< ReadShelfDetails >( readShelfQuery( shelfId ).queryKey )?.slug;
			// `params.layout` is a partial merge (see `UpdateReadShelfParams`), so merge
			// it onto the existing layout rather than replacing it.
			queryClient.setQueryData< ReadShelf[] >(
				readShelvesQuery().queryKey,
				( previous ) =>
					previous?.map( ( item ) =>
						item.id === shelfId
							? {
									...item,
									...( params.name !== undefined ? { name: params.name } : {} ),
									layout: { ...item.layout, ...params.layout },
							  }
							: item
					)
			);
			return { previousList, previousSlug };
		},
		onError: ( _error, _variables, context ) => {
			if ( context?.previousList ) {
				queryClient.setQueryData( readShelvesQuery().queryKey, context.previousList );
			}
		},
		onSuccess: ( shelf, _variables, context ) => {
			// Update may change summary fields (title/slug/layout), so refresh the
			// matching list item as well as the detail caches.
			const summary = toSummary( shelf );
			queryClient.setQueryData< ReadShelf[] >(
				readShelvesQuery().queryKey,
				( previous ) => previous?.map( ( item ) => ( item.id === shelf.id ? summary : item ) )
			);
			setReadShelfDetailCaches( queryClient, shelf );
			// A rename changes the slug, so the entry the old URL resolved through is
			// now stale — drop it so a lingering old-slug view can't render old data.
			if ( context?.previousSlug && context.previousSlug !== shelf.slug ) {
				queryClient.removeQueries( {
					queryKey: readShelfBySlugQuery( context.previousSlug ).queryKey,
				} );
			}
			// Tags/feeds/languages may have changed, so reload both the posts feed and
			// the Discover stream (languages filter Discover).
			void reloadReadShelfStreams( queryClient, shelf.id );
			void invalidateReadShelfListAndDetail( queryClient, shelf.id );
		},
	} );

// Delete a shelf, then drop it from the caches. Not wired to any UI yet; a
// delete control can adopt it via a `useDeleteShelf()` consumer hook. The server
// hard-deletes (no undo), so the caller should confirm before mutating.
export const deleteReadShelfMutation = ( queryClient: QueryClient ) =>
	mutationOptions< ReadShelfDeletionResult, unknown, string >( {
		meta: { statId: 'read-shelf-delete' },
		mutationFn: deleteReadShelf,
		onSuccess: ( _result, shelfId ) => {
			// Resolve the deleted shelf's slug (from the list, falling back to the
			// id-keyed detail cache) before we drop it, so its by-slug detail cache can be
			// discarded too.
			const deletedSlug =
				queryClient
					.getQueryData< ReadShelf[] >( readShelvesQuery().queryKey )
					?.find( ( shelf ) => shelf.id === shelfId )?.slug ??
				queryClient.getQueryData< ReadShelfDetails >( readShelfQuery( shelfId ).queryKey )?.slug;
			// Remove the deleted shelf from the cached list...
			queryClient.setQueryData< ReadShelf[] >(
				readShelvesQuery().queryKey,
				( previous ) => previous?.filter( ( shelf ) => shelf.id !== shelfId )
			);
			// ...and discard its now-defunct detail caches (id- and slug-keyed).
			queryClient.removeQueries( { queryKey: readShelfQuery( shelfId ).queryKey } );
			if ( deletedSlug ) {
				queryClient.removeQueries( { queryKey: readShelfBySlugQuery( deletedSlug ).queryKey } );
			}
			void invalidateReadShelvesList( queryClient );
		},
	} );

// Add/remove a followed feed. Both endpoints return the updated detail, so we
// write it straight to the detail cache (the list summary is unaffected by
// feeds). `subscription` carries the feed id/url the api-core mutator sends.
const writeReadShelfDetail = ( queryClient: QueryClient, shelf: ReadShelfDetails ) => {
	setReadShelfDetailCaches( queryClient, shelf );
	// Adding/removing a feed changes the shelf's streams, so reload both.
	void reloadReadShelfStreams( queryClient, shelf.id );
	void invalidateReadShelfDetail( queryClient, shelf.id );
};

export const addReadShelfSourceMutation = ( queryClient: QueryClient ) =>
	mutationOptions< ReadShelfDetails, unknown, ReadShelfSourceMutationParams >( {
		meta: { statId: 'read-shelf-source-add' },
		mutationFn: addReadShelfSource,
		onSuccess: ( shelf ) => writeReadShelfDetail( queryClient, shelf ),
	} );

export const deleteReadShelfSourceMutation = ( queryClient: QueryClient ) =>
	mutationOptions< ReadShelfDetails, unknown, ReadShelfSourceMutationParams >( {
		meta: { statId: 'read-shelf-source-delete' },
		mutationFn: deleteReadShelfSource,
		onSuccess: ( shelf ) => writeReadShelfDetail( queryClient, shelf ),
	} );
