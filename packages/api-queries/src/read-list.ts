import { fetchReadListItems, ReadListItemsResponse } from '@automattic/api-core';
import { infiniteQueryOptions } from '@tanstack/react-query';

const PER_PAGE: number = 20;

export const readListItemsInfiniteQuery = ( userLogin: string, listName: string ) => {
	return infiniteQueryOptions( {
		queryKey: [ 'read', 'list', userLogin, listName, 'items', 'infinite' ],
		queryFn: ( { pageParam }: { pageParam: number } ) =>
			fetchReadListItems( userLogin, listName, pageParam, PER_PAGE ),
		enabled: !! userLogin && !! listName,
		staleTime: 30 * 60000, // 30 minutes
		initialPageParam: 1,
		getNextPageParam: ( lastPage: ReadListItemsResponse, allPages: ReadListItemsResponse[] ) => {
			if ( ! lastPage?.items || lastPage.items.length < PER_PAGE ) {
				return undefined;
			}

			return allPages.length + 1;
		},
	} );
};
