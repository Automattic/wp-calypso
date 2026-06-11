import {
	addReadSpaceSource,
	createReadSpace,
	deleteReadSpaceSource,
	fetchReadSpace,
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

const readSpaceDetailKey = ( spaceId: string ) => [ 'read', 'spaces', 'detail', spaceId ] as const;

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

export const readSpaceQuery = ( spaceId: string ) =>
	queryOptions( {
		queryKey: readSpaceDetailKey( spaceId ),
		queryFn: () => fetchReadSpace( spaceId ),
		// Same in-memory placeholder caveats as the list query above (RSM-4145).
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
			// No network round-trip yet (RSM-4139): the created space is appended
			// straight to the cached list so it shows up in the sidebar at once.
			queryClient.setQueryData< ReadSpace[] >( readSpacesQuery().queryKey, ( previous ) => [
				...( previous ?? [] ),
				space,
			] );
			// Seed the detail cache too so the sources modal can open the freshly
			// created space without hitting `fetchReadSpace` (which only knows the
			// placeholder set).
			queryClient.setQueryData< ReadSpace >( readSpaceQuery( space.id ).queryKey, space );
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
	previousSpace?: ReadSpace;
};

// Optimistically patch a space's sources in both the list and the single-space
// detail caches, returning the pre-patch snapshots so `onError` can roll back.
// We deliberately don't invalidate on settle: spaces have no real endpoint yet
// (RSM-4145) — they live in-memory with `staleTime: Infinity`, so a refetch
// would clobber the optimistic state.
const patchSpaceSources = (
	queryClient: QueryClient,
	spaceId: string,
	updateSources: ( sources: SpaceSource[] ) => SpaceSource[]
): ReadSpaceSourceMutationContext => {
	const listKey = readSpacesQuery().queryKey;
	const detailKey = readSpaceQuery( spaceId ).queryKey;

	const previousSpaces = queryClient.getQueryData< ReadSpace[] >( listKey );
	const previousSpace = queryClient.getQueryData< ReadSpace >( detailKey );

	const applyToSpace = ( space: ReadSpace ): ReadSpace =>
		space.id === spaceId ? { ...space, sources: updateSources( space.sources ) } : space;

	queryClient.setQueryData< ReadSpace[] >( listKey, ( previous ) =>
		( previous ?? [] ).map( applyToSpace )
	);
	queryClient.setQueryData< ReadSpace >( detailKey, ( previous ) =>
		previous ? applyToSpace( previous ) : previous
	);

	return { previousSpaces, previousSpace };
};

const rollbackSpaceSources = (
	queryClient: QueryClient,
	spaceId: string,
	context?: ReadSpaceSourceMutationContext
) => {
	if ( context?.previousSpaces ) {
		queryClient.setQueryData( readSpacesQuery().queryKey, context.previousSpaces );
	}
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
