import {
	addReadSpaceSource,
	canonicalizeReadSpaceSlug,
	createReadSpace,
	deleteReadSpace,
	deleteReadSpaceSource,
	fetchReadSpace,
	fetchReadSpaceBySlug,
	fetchReadSpaces,
	isWpError,
	updateReadSpace,
	type ReadSpace,
	type ReadSpaceDeletionResult,
	type ReadSpaceDetails,
	type ReadSpaceSourceMutationParams,
	type UpdateReadSpaceParams,
} from '@automattic/api-core';
import {
	keepPreviousData,
	mutationOptions,
	queryOptions,
	type QueryClient,
} from '@tanstack/react-query';
import { getStreamInfiniteQueryKeyPrefix } from './read-streams';

const readSpacesListKey = [ 'read', 'spaces', 'list' ] as const;

const readSpaceDetailKey = ( spaceId: string ) => [ 'read', 'spaces', 'detail', spaceId ] as const;

// Canonicalize the slug so callers that pass the encoded API slug (sidebar,
// mutations) and the one that passes the decoded route slug (the view) land on the
// same key. No-op for ASCII slugs.
const readSpaceBySlugKey = ( slug: string ) =>
	[ 'read', 'spaces', 'detail-by-slug', canonicalizeReadSpaceSlug( slug ) ] as const;

// A space drives two streams: the posts feed (`space:<id>`, built server-side
// from the space's followed feeds and tags) and Discover (`space_discover:<id>`,
// on-topic recommendations filtered by the space's languages). Editing the space
// — tags, feeds, or languages — changes which posts either stream returns, so
// both have to reload. Discover in particular is filtered by the space's
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
const reloadReadSpaceStreams = ( queryClient: QueryClient, spaceId: string ) =>
	Promise.all( [
		queryClient.resetQueries( {
			queryKey: getStreamInfiniteQueryKeyPrefix( `space:${ spaceId }` ),
		} ),
		queryClient.resetQueries( {
			queryKey: getStreamInfiniteQueryKeyPrefix( `space_discover:${ spaceId }` ),
		} ),
	] );

export const readSpacesQuery = () =>
	queryOptions( {
		queryKey: readSpacesListKey,
		queryFn: () => fetchReadSpaces(),
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

export const readSpaceQuery = ( spaceId: string ) =>
	queryOptions( {
		queryKey: readSpaceDetailKey( spaceId ),
		queryFn: () => fetchReadSpace( spaceId ),
		staleTime: Infinity,
		refetchOnMount: 'always',
		// A 4xx is terminal (the space is gone or not the viewer's), so surface it
		// at once rather than backing off through TanStack's default three retries.
		// Calypso boots its own QueryClient without a retry default (unlike this
		// package's client), so gate it here.
		retry: ( failureCount, error ) => ! isClientError( error ) && failureCount < 3,
		// No `placeholderData: keepPreviousData` here: when `spaceId` changes the
		// detail view (or a still-mounted Sources modal) must not flash the previous
		// space's name/sources. The persisted cache + mount-time refetch already keep
		// the *same* space's data visible while it refreshes.
		meta: { persist: true },
	} );

// Read a space by its URL slug (`GET /reader/spaces/slug/{slug}`). Slug-addressed
// URLs resolve through this; the resolved detail carries the numeric `id` that
// streams and mutations use. Keyed by slug, so a rename (which changes the slug)
// lands on a fresh entry — the mutations below seed the new slug and drop the old.
// Same config as `readSpaceQuery`: a 4xx (unknown/renamed-away/not-yours slug) is
// terminal, so surface it at once rather than retrying.
export const readSpaceBySlugQuery = ( slug: string ) =>
	queryOptions( {
		queryKey: readSpaceBySlugKey( slug ),
		queryFn: () => fetchReadSpaceBySlug( slug ),
		staleTime: Infinity,
		refetchOnMount: 'always',
		retry: ( failureCount, error ) => ! isClientError( error ) && failureCount < 3,
		meta: { persist: true },
	} );

// The summary (list) shape is the detail minus its `sources`, `tags`, and
// `languages` (the detail-only fields).
const toSummary = ( space: ReadSpaceDetails ): ReadSpace => {
	const { sources, tags, languages, ...summary } = space;
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

const invalidateReadSpacesList = ( queryClient: QueryClient ) =>
	queryClient.invalidateQueries( { queryKey: readSpacesQuery().queryKey } );

const invalidateReadSpaceDetail = ( queryClient: QueryClient, spaceId: string ) =>
	queryClient.invalidateQueries( { queryKey: readSpaceQuery( spaceId ).queryKey } );

const invalidateReadSpaceListAndDetail = ( queryClient: QueryClient, spaceId: string ) =>
	Promise.all( [
		invalidateReadSpacesList( queryClient ),
		invalidateReadSpaceDetail( queryClient, spaceId ),
	] ).then( () => undefined );

// Every mutation returns the full detail. Write it to both detail caches — the
// id-keyed one (streams, the Customize modal) and the slug-keyed one (how the
// space view resolves its URL) — so a slug-addressed view paints from cache the
// instant it lands, without a round-trip. A rename also seeds the *new* slug here,
// so redirecting to it after the save is seamless.
const setReadSpaceDetailCaches = ( queryClient: QueryClient, space: ReadSpaceDetails ) => {
	queryClient.setQueryData< ReadSpaceDetails >( readSpaceQuery( space.id ).queryKey, space );
	queryClient.setQueryData< ReadSpaceDetails >(
		readSpaceBySlugQuery( space.slug ).queryKey,
		space
	);
};

export const createReadSpaceMutation = ( queryClient: QueryClient ) =>
	mutationOptions( {
		meta: { statId: 'read-space-create' },
		mutationFn: createReadSpace,
		onSuccess: ( space ) => {
			// Append the summary to the list and seed the detail cache so the sidebar
			// and the (just-opened) sources modal both reflect the new space at once.
			queryClient.setQueryData< ReadSpace[] >( readSpacesQuery().queryKey, ( previous ) => [
				...( previous ?? [] ),
				toSummary( space ),
			] );
			setReadSpaceDetailCaches( queryClient, space );
			// Reconcile in the background — don't await the refetch so the consumer's
			// own onSuccess (close modal, redirect) fires immediately off the cache write.
			void invalidateReadSpaceListAndDetail( queryClient, space.id );
		},
	} );

type UpdateReadSpaceVariables = {
	spaceId: string;
	params: UpdateReadSpaceParams;
};

export const updateReadSpaceMutation = ( queryClient: QueryClient ) =>
	mutationOptions<
		ReadSpaceDetails,
		unknown,
		UpdateReadSpaceVariables,
		{ previousList: ReadSpace[] | undefined; previousSlug: string | undefined }
	>( {
		meta: { statId: 'read-space-update' },
		mutationFn: ( { spaceId, params } ) => updateReadSpace( spaceId, params ),
		// Optimistically patch the cached list summary so the sidebar — which reads
		// `useSpaces()` (this list) and renders each item's icon and colour from
		// `layout` via `resolveSpaceIconColor` — reflects a name/icon/colour change
		// the instant the user saves, without waiting for the round-trip. `onSuccess`
		// then writes the canonical server detail over the top.
		onMutate: async ( { spaceId, params } ) => {
			// `cancelQueries` is best-effort per the TanStack docs; if it rejects we
			// must still apply the optimistic write and let the mutationFn run.
			try {
				await queryClient.cancelQueries( { queryKey: readSpacesQuery().queryKey } );
			} catch {
				// no-op — fall through to the optimistic write below.
			}
			const previousList = queryClient.getQueryData< ReadSpace[] >( readSpacesQuery().queryKey );
			// The slug we're currently addressed by, captured before the rename so
			// `onSuccess` can drop its now-stale by-slug cache entry. Prefer the list, but
			// fall back to the id-keyed detail cache so eviction still happens when the
			// list query hasn't populated.
			const previousSlug =
				previousList?.find( ( item ) => item.id === spaceId )?.slug ??
				queryClient.getQueryData< ReadSpaceDetails >( readSpaceQuery( spaceId ).queryKey )?.slug;
			// `params.layout` is a partial merge (see `UpdateReadSpaceParams`), so merge
			// it onto the existing layout rather than replacing it.
			queryClient.setQueryData< ReadSpace[] >(
				readSpacesQuery().queryKey,
				( previous ) =>
					previous?.map( ( item ) =>
						item.id === spaceId
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
				queryClient.setQueryData( readSpacesQuery().queryKey, context.previousList );
			}
		},
		onSuccess: ( space, _variables, context ) => {
			// Update may change summary fields (title/slug/layout), so refresh the
			// matching list item as well as the detail caches.
			const summary = toSummary( space );
			queryClient.setQueryData< ReadSpace[] >(
				readSpacesQuery().queryKey,
				( previous ) => previous?.map( ( item ) => ( item.id === space.id ? summary : item ) )
			);
			setReadSpaceDetailCaches( queryClient, space );
			// A rename changes the slug, so the entry the old URL resolved through is
			// now stale — drop it so a lingering old-slug view can't render old data.
			if ( context?.previousSlug && context.previousSlug !== space.slug ) {
				queryClient.removeQueries( {
					queryKey: readSpaceBySlugQuery( context.previousSlug ).queryKey,
				} );
			}
			// Tags/feeds/languages may have changed, so reload both the posts feed and
			// the Discover stream (languages filter Discover).
			void reloadReadSpaceStreams( queryClient, space.id );
			void invalidateReadSpaceListAndDetail( queryClient, space.id );
		},
	} );

// Delete a space, then drop it from the caches. Not wired to any UI yet; a
// delete control can adopt it via a `useDeleteSpace()` consumer hook. The server
// hard-deletes (no undo), so the caller should confirm before mutating.
export const deleteReadSpaceMutation = ( queryClient: QueryClient ) =>
	mutationOptions< ReadSpaceDeletionResult, unknown, string >( {
		meta: { statId: 'read-space-delete' },
		mutationFn: deleteReadSpace,
		onSuccess: ( _result, spaceId ) => {
			// Resolve the deleted space's slug (from the list, falling back to the
			// id-keyed detail cache) before we drop it, so its by-slug detail cache can be
			// discarded too.
			const deletedSlug =
				queryClient
					.getQueryData< ReadSpace[] >( readSpacesQuery().queryKey )
					?.find( ( space ) => space.id === spaceId )?.slug ??
				queryClient.getQueryData< ReadSpaceDetails >( readSpaceQuery( spaceId ).queryKey )?.slug;
			// Remove the deleted space from the cached list...
			queryClient.setQueryData< ReadSpace[] >(
				readSpacesQuery().queryKey,
				( previous ) => previous?.filter( ( space ) => space.id !== spaceId )
			);
			// ...and discard its now-defunct detail caches (id- and slug-keyed).
			queryClient.removeQueries( { queryKey: readSpaceQuery( spaceId ).queryKey } );
			if ( deletedSlug ) {
				queryClient.removeQueries( { queryKey: readSpaceBySlugQuery( deletedSlug ).queryKey } );
			}
			void invalidateReadSpacesList( queryClient );
		},
	} );

// Add/remove a followed feed. Both endpoints return the updated detail, so we
// write it straight to the detail cache (the list summary is unaffected by
// feeds). `subscription` carries the feed id/url the api-core mutator sends.
const writeReadSpaceDetail = ( queryClient: QueryClient, space: ReadSpaceDetails ) => {
	setReadSpaceDetailCaches( queryClient, space );
	// Adding/removing a feed changes the space's streams, so reload both.
	void reloadReadSpaceStreams( queryClient, space.id );
	void invalidateReadSpaceDetail( queryClient, space.id );
};

export const addReadSpaceSourceMutation = ( queryClient: QueryClient ) =>
	mutationOptions< ReadSpaceDetails, unknown, ReadSpaceSourceMutationParams >( {
		meta: { statId: 'read-space-source-add' },
		mutationFn: addReadSpaceSource,
		onSuccess: ( space ) => writeReadSpaceDetail( queryClient, space ),
	} );

export const deleteReadSpaceSourceMutation = ( queryClient: QueryClient ) =>
	mutationOptions< ReadSpaceDetails, unknown, ReadSpaceSourceMutationParams >( {
		meta: { statId: 'read-space-source-delete' },
		mutationFn: deleteReadSpaceSource,
		onSuccess: ( space ) => writeReadSpaceDetail( queryClient, space ),
	} );
