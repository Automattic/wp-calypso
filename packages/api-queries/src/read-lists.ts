import {
	createReadList,
	deleteReadList,
	fetchReadList,
	fetchReadListItems,
	fetchReadSubscribedLists,
	followReadList,
	unfollowReadList,
	updateReadList,
	type ReadListItemsResponse,
} from '@automattic/api-core';
import { infiniteQueryOptions, mutationOptions, queryOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';

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

export const createReadListMutation = () =>
	mutationOptions( {
		mutationFn: createReadList,
		onSuccess: ( data ) => {
			queryClient.setQueryData( readListQuery( data.list.owner, data.list.slug ).queryKey, data );
			queryClient.invalidateQueries( {
				queryKey: readSubscribedListsQuery().queryKey,
			} );
		},
	} );

export const updateReadListMutation = () =>
	mutationOptions( {
		mutationFn: updateReadList,
		onSuccess: ( data ) => {
			queryClient.setQueryData( readListQuery( data.list.owner, data.list.slug ).queryKey, data );
			queryClient.invalidateQueries( {
				queryKey: readSubscribedListsQuery().queryKey,
			} );
		},
	} );

export const followReadListMutation = () =>
	mutationOptions( {
		mutationFn: ( { owner, slug }: { owner: string; slug: string } ) =>
			followReadList( owner, slug ),
		onSuccess: () => {
			queryClient.invalidateQueries( {
				queryKey: readSubscribedListsQuery().queryKey,
			} );
		},
	} );

export const unfollowReadListMutation = () =>
	mutationOptions( {
		mutationFn: ( { owner, slug }: { owner: string; slug: string } ) =>
			unfollowReadList( owner, slug ),
		onSuccess: () => {
			queryClient.invalidateQueries( {
				queryKey: readSubscribedListsQuery().queryKey,
			} );
		},
	} );

export const deleteReadListMutation = () =>
	mutationOptions( {
		mutationFn: ( { owner, slug }: { owner: string; slug: string } ) =>
			deleteReadList( owner, slug ),
		onSuccess: ( _data, { owner, slug } ) => {
			queryClient.removeQueries( { queryKey: readListQuery( owner, slug ).queryKey } );
			queryClient.invalidateQueries( {
				queryKey: readSubscribedListsQuery().queryKey,
			} );
		},
	} );
