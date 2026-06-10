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

export const addReadSpaceSourceMutation = ( queryClient: QueryClient ) =>
	mutationOptions< void, Error, ReadSpaceSourceMutationParams >( {
		mutationFn: addReadSpaceSource,
		onSuccess: ( _data, { spaceId, subscription } ) => {
			const source = createSpaceSource( subscription );
			const sourceKey = getReadSpaceSourceKey( source );

			queryClient.setQueryData< ReadSpace[] >( readSpacesQuery().queryKey, ( previous ) =>
				( previous ?? [] ).map( ( space ) => {
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
				} )
			);
		},
	} );

export const deleteReadSpaceSourceMutation = ( queryClient: QueryClient ) =>
	mutationOptions< void, Error, ReadSpaceSourceMutationParams >( {
		mutationFn: deleteReadSpaceSource,
		onSuccess: ( _data, { spaceId, subscription } ) => {
			const subscriptionKey = getSiteSubscriptionSourceKey( subscription );

			queryClient.setQueryData< ReadSpace[] >( readSpacesQuery().queryKey, ( previous ) =>
				( previous ?? [] ).map( ( space ) => {
					if ( space.id !== spaceId ) {
						return space;
					}

					return {
						...space,
						sources: space.sources.filter(
							( existingSource ) => getReadSpaceSourceKey( existingSource ) !== subscriptionKey
						),
					};
				} )
			);
		},
	} );
