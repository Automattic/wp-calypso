import {
	addReadSpaceSource,
	createReadSpace,
	deleteReadSpace,
	deleteReadSpaceSource,
	fetchReadSpace,
	fetchReadSpaces,
	getReadSpaceSourceKey,
	getSiteSubscriptionSourceKey,
	type ReadSpace,
	type ReadSpaceDeletionResult,
	type ReadSpaceDetails,
	type ReadSpaceSourceMutationParams,
	type SpaceSource,
	type SiteSubscriptionItem,
} from '@automattic/api-core';
import { mutationOptions, queryOptions, type QueryClient } from '@tanstack/react-query';

const readSpacesListKey = [ 'read', 'spaces', 'list' ] as const;

const readSpaceDetailKey = ( spaceId: string ) => [ 'read', 'spaces', 'detail', spaceId ] as const;

export const readSpacesQuery = () =>
	queryOptions( {
		queryKey: readSpacesListKey,
		queryFn: () => fetchReadSpaces(),
		// The list endpoint is real, but the create flow patches this cache
		// directly and the detail endpoint is still a placeholder (RSM-4145), so
		// hold refetches off to avoid clobbering those in-memory writes.
		staleTime: Infinity,
		// Keep this out of Calypso's persisted query cache so a reload always
		// refetches a fresh list from the server rather than rehydrating a stale
		// dehydrated copy.
		meta: { persist: false },
	} );

export const readSpaceQuery = ( spaceId: string ) =>
	queryOptions( {
		queryKey: readSpaceDetailKey( spaceId ),
		queryFn: () => fetchReadSpace( spaceId ),
		// The single-space/detail endpoint isn't wired yet (RSM-4145): its data is
		// seeded by the create mutation and patched by the source mutations in
		// memory, so never refetch it out from under those writes.
		staleTime: Infinity,
		meta: { persist: false },
	} );

// Calypso boots its own QueryClient (see `client/state/query-client.ts`) instead
// of the singleton from this package, so the mutation factory accepts the
// caller's QueryClient and uses it to write the cache. Pass `useQueryClient()`
// from the consuming component.
export const createReadSpaceMutation = ( queryClient: QueryClient ) =>
	mutationOptions( {
		mutationFn: createReadSpace,
		onSuccess: ( space ) => {
			// Create hits the real POST and returns the canonical space, so append
			// it straight to the list cache for instant feedback — the same entry
			// comes back on the next real list fetch, so there's no temp-id
			// reconciliation to do. Append the list-shaped space (sources live only
			// on the detail cache) so the sidebar reflects it at once...
			//
			// TODO(RSM-4145): once the detail endpoint is also real, switch these
			// manual writes to `queryClient.invalidateQueries( readSpacesQuery() )`
			// and drop the `staleTime: Infinity` / `meta: { persist: false }` so the
			// list and detail reconcile against canonical server state.
			const { sources, ...listSpace } = space;
			queryClient.setQueryData< ReadSpace[] >( readSpacesQuery().queryKey, ( previous ) => [
				...( previous ?? [] ),
				listSpace,
			] );
			// ...and seed the detail cache so the sources modal can open the freshly
			// created space without hitting `fetchReadSpace`, which is still a
			// placeholder that only knows the seeded set (RSM-4145).
			queryClient.setQueryData< ReadSpaceDetails >( readSpaceQuery( space.id ).queryKey, {
				...listSpace,
				sources,
			} );
		},
	} );

// Delete a space, then drop it from the caches. Like the other factories this
// takes the consumer's QueryClient (Calypso boots its own — see above). Not
// wired to any UI yet; a delete control can adopt it via a `useDeleteSpace()`
// consumer hook. The server hard-deletes (no undo), so the caller should
// confirm before mutating.
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

const createSpaceSource = ( subscription: SiteSubscriptionItem ): SpaceSource => ( {
	feedId: subscription.feed_ID ?? null,
	blogId: subscription.blog_ID ?? null,
	feedUrl: subscription.feed_URL,
	siteUrl: subscription.URL || subscription.feed_URL,
	name: subscription.name || subscription.URL || subscription.feed_URL,
	siteIcon: subscription.site_icon ?? null,
} );

type ReadSpaceSourceMutationContext = {
	previousSpace?: ReadSpaceDetails;
};

// Optimistically patch a space's sources in the single-space detail cache
// (sources only live there, not in the list), returning the pre-patch snapshot
// so `onError` can roll back. We deliberately don't invalidate on settle: spaces
// have no real endpoint yet (RSM-4145) — the detail lives in-memory with
// `staleTime: Infinity`, so a refetch would clobber the optimistic state.
const patchSpaceSources = async (
	queryClient: QueryClient,
	spaceId: string,
	updateSources: ( sources: SpaceSource[] ) => SpaceSource[]
): Promise< ReadSpaceSourceMutationContext > => {
	const detailKey = readSpaceQuery( spaceId ).queryKey;

	// Cancel an in-flight detail fetch (e.g. the modal just opened) so it can't
	// resolve after our optimistic write and clobber it. Best-effort per TanStack
	// docs; if cancel fails the optimistic patch below must still run.
	try {
		await queryClient.cancelQueries( { queryKey: detailKey } );
	} catch {
		// ignore — the optimistic patch must still run
	}

	const previousSpace = queryClient.getQueryData< ReadSpaceDetails >( detailKey );

	queryClient.setQueryData< ReadSpaceDetails >( detailKey, ( previous ) =>
		previous ? { ...previous, sources: updateSources( previous.sources ) } : previous
	);

	return { previousSpace };
};

const rollbackSpaceSources = (
	queryClient: QueryClient,
	spaceId: string,
	context?: ReadSpaceSourceMutationContext
) => {
	if ( context?.previousSpace ) {
		queryClient.setQueryData( readSpaceQuery( spaceId ).queryKey, context.previousSpace );
	}
};

export const addReadSpaceSourceMutation = ( queryClient: QueryClient ) =>
	mutationOptions< void, Error, ReadSpaceSourceMutationParams, ReadSpaceSourceMutationContext >( {
		mutationFn: addReadSpaceSource,
		// Optimistically append the source so the modal reflects the change at
		// once; `onError` rolls back if the (future, RSM-4139) endpoint rejects.
		onMutate: ( { spaceId, subscription } ) => {
			const source = createSpaceSource( subscription );
			const sourceKey = getReadSpaceSourceKey( source );

			return patchSpaceSources( queryClient, spaceId, ( sources ) =>
				sources.some( ( existingSource ) => getReadSpaceSourceKey( existingSource ) === sourceKey )
					? sources
					: [ ...sources, source ]
			);
		},
		onError: ( _error, { spaceId }, context ) =>
			rollbackSpaceSources( queryClient, spaceId, context ),
	} );

export const deleteReadSpaceSourceMutation = ( queryClient: QueryClient ) =>
	mutationOptions< void, Error, ReadSpaceSourceMutationParams, ReadSpaceSourceMutationContext >( {
		mutationFn: deleteReadSpaceSource,
		// Optimistically remove the source; `onError` restores it if the
		// (future, RSM-4139) endpoint rejects.
		onMutate: ( { spaceId, subscription } ) => {
			const subscriptionKey = getSiteSubscriptionSourceKey( subscription );

			return patchSpaceSources( queryClient, spaceId, ( sources ) =>
				sources.filter(
					( existingSource ) => getReadSpaceSourceKey( existingSource ) !== subscriptionKey
				)
			);
		},
		onError: ( _error, { spaceId }, context ) =>
			rollbackSpaceSources( queryClient, spaceId, context ),
	} );
