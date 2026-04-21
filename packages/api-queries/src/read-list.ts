import { fetchReadListItems, ReadListItemsResponse } from '@automattic/api-core';
import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';

const PER_PAGE: number = 20;

export const readListItemsInfiniteQuery = (
	userLogin: string,
	listName: string,
	meta: string = ''
) => {
	return infiniteQueryOptions( {
		queryKey: [ 'read', 'list', userLogin, listName, 'items', meta, 'infinite' ],
		queryFn: ( { pageParam }: { pageParam: number } ) =>
			fetchReadListItems( userLogin, listName, meta, pageParam, PER_PAGE ),
		enabled: !! userLogin && !! listName,
		staleTime: 5 * 60000, // 5 minutes
		initialPageParam: 1,
		getNextPageParam: ( lastPage: ReadListItemsResponse, allPages: ReadListItemsResponse[] ) => {
			if ( ! lastPage?.items || lastPage.items.length < PER_PAGE ) {
				return undefined;
			}

			return allPages.length + 1;
		},
	} );
};

export const readListItemsQuery = ( userLogin: string, listName: string, meta: string = '' ) => {
	return queryOptions( {
		queryKey: [ 'read', 'list', userLogin, listName, 'items', meta ],
		queryFn: () => fetchReadListItems( userLogin, listName, meta ),
		enabled: !! userLogin && !! listName,
		staleTime: 5 * 60000, // 5 minutes
	} );
};
