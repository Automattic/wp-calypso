import {
	addReadSpaceSource,
	createReadSpace,
	deleteReadSpaceSource,
	fetchReadSpaces,
	getReadSpaceSourceKey,
	getSiteSubscriptionSourceKey,
	type ReadSpace,
	type ReadSpaceSourceMutationParams,
	type SpaceSource,
	type SiteSubscriptionItem,
} from '@automattic/api-core';
import { mutationOptions, queryOptions, type QueryClient } from '@tanstack/react-query';

const readSpacesListKey = [ 'read', 'spaces', 'list' ] as const;

export const readSpacesQuery = () =>
	queryOptions( {
		queryKey: readSpacesListKey,
		queryFn: () => fetchReadSpaces(),
		// No real list endpoint yet (RSM-4145). The list is seeded and mutated
		// in-memory, so never refetch it out from under the create flow.
		staleTime: Infinity,
		// Keep the placeholder data out of Calypso's persisted query cache:
		// with `staleTime: Infinity` a dehydrated copy would survive reloads for
		// days and mask the real list once the endpoint ships.
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
			// No network round-trip yet (RSM-4139): the created space is appended
			// straight to the cached list so it shows up in the sidebar at once.
			queryClient.setQueryData< ReadSpace[] >( readSpacesQuery().queryKey, ( previous ) => [
				...( previous ?? [] ),
				space,
			] );
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
	previousSpaces?: ReadSpace[];
};

// Patch the cached spaces list and return the pre-patch snapshot so `onError`
// can roll back. We deliberately don't invalidate on settle: the list has no
// real endpoint yet (RSM-4145) — it lives in-memory with `staleTime: Infinity`,
// so a refetch would clobber the optimistic state.
const patchCachedSpaces = (
	queryClient: QueryClient,
	updateSpace: ( space: ReadSpace ) => ReadSpace
): ReadSpaceSourceMutationContext => {
	const previousSpaces = queryClient.getQueryData< ReadSpace[] >( readSpacesQuery().queryKey );

	queryClient.setQueryData< ReadSpace[] >( readSpacesQuery().queryKey, ( previous ) =>
		( previous ?? [] ).map( updateSpace )
	);

	return { previousSpaces };
};

const rollbackCachedSpaces = (
	queryClient: QueryClient,
	context?: ReadSpaceSourceMutationContext
) => {
	if ( context?.previousSpaces ) {
		queryClient.setQueryData( readSpacesQuery().queryKey, context.previousSpaces );
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

			return patchCachedSpaces( queryClient, ( space ) => {
				if ( space.id !== spaceId ) {
					return space;
				}

				if (
					space.sources.some(
						( existingSource ) => getReadSpaceSourceKey( existingSource ) === sourceKey
					)
				) {
					return space;
				}

				return {
					...space,
					sources: [ ...space.sources, source ],
				};
			} );
		},
		onError: ( _error, _params, context ) => rollbackCachedSpaces( queryClient, context ),
	} );

export const deleteReadSpaceSourceMutation = ( queryClient: QueryClient ) =>
	mutationOptions< void, Error, ReadSpaceSourceMutationParams, ReadSpaceSourceMutationContext >( {
		mutationFn: deleteReadSpaceSource,
		// Optimistically remove the source; `onError` restores it if the
		// (future, RSM-4139) endpoint rejects.
		onMutate: ( { spaceId, subscription } ) => {
			const subscriptionKey = getSiteSubscriptionSourceKey( subscription );

			return patchCachedSpaces( queryClient, ( space ) => {
				if ( space.id !== spaceId ) {
					return space;
				}

				return {
					...space,
					sources: space.sources.filter(
						( existingSource ) => getReadSpaceSourceKey( existingSource ) !== subscriptionKey
					),
				};
			} );
		},
		onError: ( _error, _params, context ) => rollbackCachedSpaces( queryClient, context ),
	} );
