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
import { mutationOptions, queryOptions, type QueryClient } from '@tanstack/react-query';

const readSpacesListKey = [ 'read', 'spaces', 'list' ] as const;

const readSpaceDetailKey = ( spaceId: string ) => [ 'read', 'spaces', 'detail', spaceId ] as const;

export const readSpacesQuery = () =>
	queryOptions( {
		queryKey: readSpacesListKey,
		queryFn: () => fetchReadSpaces(),
		// Every mutation returns the full detail and writes it back to these caches,
		// so they stay authoritative without refetch churn — hold refetches off.
		// (First load still fetches; staleTime only suppresses refetching fresh data.)
		staleTime: Infinity,
		// Keep the list out of Calypso's persisted query cache: layout_color/icon
		// are random-until-set server-side, so a dehydrated copy could show stale
		// colours across reloads. A reload refetches fresh instead.
		meta: { persist: false },
	} );

export const readSpaceQuery = ( spaceId: string ) =>
	queryOptions( {
		queryKey: readSpaceDetailKey( spaceId ),
		queryFn: () => fetchReadSpace( spaceId ),
		staleTime: Infinity,
		meta: { persist: false },
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
// the caches (no follow-up GET, no optimistic patch/rollback): the detail cache
// gets the returned space, and the list cache gets its summary.

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
		},
	} );

// Add/remove a followed feed. Both endpoints return the updated detail, so we
// write it straight to the detail cache (the list summary is unaffected by
// feeds). `subscription` carries the feed id/url the api-core mutator sends.
const writeReadSpaceDetail = ( queryClient: QueryClient, space: ReadSpaceDetails ) =>
	queryClient.setQueryData< ReadSpaceDetails >( readSpaceQuery( space.id ).queryKey, space );

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
