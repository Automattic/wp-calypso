import {
	createReadList,
	deleteReadList,
	fetchReadList,
	fetchReadSubscribedLists,
	fetchReadUserLists,
	followReadList,
	unfollowReadList,
	updateReadList,
	type ReadSubscribedListsResponse,
} from '@automattic/api-core';
import { mutationOptions, queryOptions, type QueryClient } from '@tanstack/react-query';

export const readSubscribedListsQuery = () =>
	queryOptions( {
		queryKey: [ 'read', 'lists', 'subscribed' ],
		staleTime: 1000 * 60 * 5, // 5 minutes — lists change infrequently
		queryFn: () => fetchReadSubscribedLists(),
	} );

export const readListQuery = ( owner: string, slug: string ) =>
	queryOptions( {
		queryKey: [ 'read', 'lists', owner, slug ],
		staleTime: 1000 * 60 * 5,
		queryFn: () => fetchReadList( owner, slug ),
	} );

export const readUserListsQuery = ( userLogin: string ) =>
	queryOptions( {
		queryKey: [ 'read', 'lists', 'user', userLogin ],
		queryFn: () => fetchReadUserLists( userLogin ),
		enabled: !! userLogin,
		staleTime: 1000 * 60 * 5,
	} );

/**
 * Patch the unseen_count of every feed matching `feedIds` inside the subscribed
 * lists query data — the source for the sidebar Lists dropdown counts. Mirrors
 * `patchSubscriptionSeenCount` so marking posts seen/unseen anywhere keeps the
 * Lists dropdown counts in sync optimistically.
 */
export const patchListsSeenCount = (
	queryClient: QueryClient,
	feedIds: number[],
	update: ( currentCount: number ) => number
) => {
	if ( ! feedIds.length ) {
		return;
	}

	const feedIdSet = new Set( feedIds.map( Number ) );

	queryClient.setQueryData< ReadSubscribedListsResponse >(
		readSubscribedListsQuery().queryKey,
		( data ) => {
			if ( ! data ) {
				return data;
			}

			return {
				...data,
				lists: data.lists.map( ( list ) => {
					if ( ! list.feeds?.length ) {
						return list;
					}

					return {
						...list,
						feeds: list.feeds.map( ( feed ) => {
							if ( ! feedIdSet.has( feed.feed_id ) ) {
								return feed;
							}

							return { ...feed, unseen_count: update( feed.unseen_count ) };
						} ),
					};
				} ),
			};
		}
	);
};

function invalidateSubscribedLists( queryClient: QueryClient ): Promise< void > {
	return queryClient.invalidateQueries( {
		queryKey: readSubscribedListsQuery().queryKey,
	} );
}

// Calypso boots its own QueryClient (see `client/state/query-client.ts`) instead
// of the singleton from this package, so each mutation factory accepts the
// caller's QueryClient and uses it for cache invalidation. Pass
// `useQueryClient()` from the consuming component.

export const createReadListMutation = ( queryClient: QueryClient ) =>
	mutationOptions( {
		mutationFn: createReadList,
		onSuccess: () => invalidateSubscribedLists( queryClient ),
	} );

export const updateReadListMutation = ( queryClient: QueryClient ) =>
	mutationOptions( {
		mutationFn: updateReadList,
		onSuccess: ( data ) => {
			queryClient.setQueryData( readListQuery( data.list.owner, data.list.slug ).queryKey, data );
			return invalidateSubscribedLists( queryClient );
		},
	} );

export const followReadListMutation = ( queryClient: QueryClient ) =>
	mutationOptions( {
		mutationFn: ( { owner, slug }: { owner: string; slug: string } ) =>
			followReadList( owner, slug ),
		onSuccess: () => invalidateSubscribedLists( queryClient ),
	} );

export const unfollowReadListMutation = ( queryClient: QueryClient ) =>
	mutationOptions( {
		mutationFn: ( { owner, slug }: { owner: string; slug: string } ) =>
			unfollowReadList( owner, slug ),
		onSuccess: () => invalidateSubscribedLists( queryClient ),
	} );

export const deleteReadListMutation = ( queryClient: QueryClient ) =>
	mutationOptions( {
		mutationFn: ( { owner, slug }: { owner: string; slug: string } ) =>
			deleteReadList( owner, slug ),
		onSuccess: ( _data, { owner, slug } ) => {
			queryClient.removeQueries( { queryKey: readListQuery( owner, slug ).queryKey } );
			return invalidateSubscribedLists( queryClient );
		},
	} );
