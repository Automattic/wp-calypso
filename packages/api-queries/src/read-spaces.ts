import {
	addReadSpaceSource,
	createReadSpace,
	deleteReadSpace,
	deleteReadSpaceSource,
	fetchReadSpace,
	fetchReadSpaces,
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

// A space's posts feed is served under the `space:<id>` stream key, built
// server-side from the space's followed feeds and tags. Editing either changes
// which posts appear, so the feed list has to reload.
//
// The feed is a cursor-paginated `useInfiniteQuery`, so a plain
// `invalidateQueries` is not enough: it refetches each cached page using the
// cursor (`before`/`offset`) it was originally loaded with, and those cursors
// were derived from the *old* post set. After the tags/feeds change the page
// boundaries no longer line up, so the reloaded list can show stale, duplicated
// or gapped posts. `resetQueries` discards the cached pages and their cursors
// and refetches the active stream from the first page — a clean reload. This
// mirrors the stream "force refresh" pattern in
// `client/reader/stream/use-stream-pending-posts.ts`.
const reloadReadSpaceStream = ( queryClient: QueryClient, spaceId: string ) =>
	queryClient.resetQueries( {
		queryKey: getStreamInfiniteQueryKeyPrefix( `space:${ spaceId }` ),
	} );

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

export const readSpaceQuery = ( spaceId: string ) =>
	queryOptions( {
		queryKey: readSpaceDetailKey( spaceId ),
		queryFn: () => fetchReadSpace( spaceId ),
		staleTime: Infinity,
		refetchOnMount: 'always',
		// No `placeholderData: keepPreviousData` here: when `spaceId` changes the
		// detail view (or a still-mounted Sources modal) must not flash the previous
		// space's name/sources. The persisted cache + mount-time refetch already keep
		// the *same* space's data visible while it refreshes.
		meta: { persist: true },
	} );

// The summary (list) shape is the detail minus its `sources` and `tags`.
const toSummary = ( space: ReadSpaceDetails ): ReadSpace => {
	const { sources, tags, ...summary } = space;
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

export const createReadSpaceMutation = ( queryClient: QueryClient ) =>
	mutationOptions( {
		mutationFn: createReadSpace,
		onSuccess: ( space ) => {
			// Append the summary to the list and seed the detail cache so the sidebar
			// and the (just-opened) sources modal both reflect the new space at once.
			queryClient.setQueryData< ReadSpace[] >( readSpacesQuery().queryKey, ( previous ) => [
				...( previous ?? [] ),
				toSummary( space ),
			] );
			queryClient.setQueryData< ReadSpaceDetails >( readSpaceQuery( space.id ).queryKey, space );
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
	mutationOptions< ReadSpaceDetails, unknown, UpdateReadSpaceVariables >( {
		mutationFn: ( { spaceId, params } ) => updateReadSpace( spaceId, params ),
		onSuccess: ( space ) => {
			// Update may change summary fields (title/layout), so refresh the matching
			// list item as well as the detail cache.
			const summary = toSummary( space );
			queryClient.setQueryData< ReadSpace[] >(
				readSpacesQuery().queryKey,
				( previous ) => previous?.map( ( item ) => ( item.id === space.id ? summary : item ) )
			);
			queryClient.setQueryData< ReadSpaceDetails >( readSpaceQuery( space.id ).queryKey, space );
			// Tags/feeds may have changed, so reload the space's posts feed.
			reloadReadSpaceStream( queryClient, space.id );
			void invalidateReadSpaceListAndDetail( queryClient, space.id );
		},
	} );

// Delete a space, then drop it from the caches. Not wired to any UI yet; a
// delete control can adopt it via a `useDeleteSpace()` consumer hook. The server
// hard-deletes (no undo), so the caller should confirm before mutating.
export const deleteReadSpaceMutation = ( queryClient: QueryClient ) =>
	mutationOptions< ReadSpaceDeletionResult, unknown, string >( {
		mutationFn: deleteReadSpace,
		onSuccess: ( _result, spaceId ) => {
			// Remove the deleted space from the cached list...
			queryClient.setQueryData< ReadSpace[] >(
				readSpacesQuery().queryKey,
				( previous ) => previous?.filter( ( space ) => space.id !== spaceId )
			);
			// ...and discard its now-defunct detail cache.
			queryClient.removeQueries( { queryKey: readSpaceQuery( spaceId ).queryKey } );
			void invalidateReadSpacesList( queryClient );
		},
	} );

// Add/remove a followed feed. Both endpoints return the updated detail, so we
// write it straight to the detail cache (the list summary is unaffected by
// feeds). `subscription` carries the feed id/url the api-core mutator sends.
const writeReadSpaceDetail = ( queryClient: QueryClient, space: ReadSpaceDetails ) => {
	queryClient.setQueryData< ReadSpaceDetails >( readSpaceQuery( space.id ).queryKey, space );
	// Adding/removing a feed changes the space's posts feed, so reload it too.
	reloadReadSpaceStream( queryClient, space.id );
	void invalidateReadSpaceDetail( queryClient, space.id );
};

export const addReadSpaceSourceMutation = ( queryClient: QueryClient ) =>
	mutationOptions< ReadSpaceDetails, unknown, ReadSpaceSourceMutationParams >( {
		mutationFn: addReadSpaceSource,
		onSuccess: ( space ) => writeReadSpaceDetail( queryClient, space ),
	} );

export const deleteReadSpaceSourceMutation = ( queryClient: QueryClient ) =>
	mutationOptions< ReadSpaceDetails, unknown, ReadSpaceSourceMutationParams >( {
		mutationFn: deleteReadSpaceSource,
		onSuccess: ( space ) => writeReadSpaceDetail( queryClient, space ),
	} );
