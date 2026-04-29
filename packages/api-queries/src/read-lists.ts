import {
	createReadList,
	deleteReadList,
	fetchReadList,
	fetchReadListItems,
	fetchReadSubscribedLists,
	fetchReadUserLists,
	followReadList,
	unfollowReadList,
	updateReadList,
	type ReadListItemsResponse,
} from '@automattic/api-core';
import {
	infiniteQueryOptions,
	mutationOptions,
	queryOptions,
	type QueryClient,
} from '@tanstack/react-query';

const ITEMS_PER_PAGE = 20;

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

export const readListItemsQuery = ( userLogin: string, listName: string, meta: string = '' ) =>
	queryOptions( {
		queryKey: [ 'read', 'lists', userLogin, listName, 'items', meta ],
		queryFn: () => fetchReadListItems( userLogin, listName, meta ),
		enabled: !! userLogin && !! listName,
		staleTime: 1000 * 60 * 5,
	} );

export const readListItemsInfiniteQuery = (
	userLogin: string,
	listName: string,
	meta: string = ''
) =>
	infiniteQueryOptions( {
		queryKey: [ 'read', 'lists', userLogin, listName, 'items', meta, 'infinite' ],
		queryFn: ( { pageParam }: { pageParam: number } ) =>
			fetchReadListItems( userLogin, listName, meta, pageParam, ITEMS_PER_PAGE ),
		enabled: !! userLogin && !! listName,
		staleTime: 1000 * 60 * 5,
		initialPageParam: 1,
		getNextPageParam: ( lastPage: ReadListItemsResponse, allPages: ReadListItemsResponse[] ) => {
			if ( ! lastPage?.items || lastPage.items.length < ITEMS_PER_PAGE ) {
				return undefined;
			}

			return allPages.length + 1;
		},
	} );

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
