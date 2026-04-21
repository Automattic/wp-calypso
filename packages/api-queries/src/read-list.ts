import { fetchReadListItems } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const readListItemsQuery = ( userLogin: string, listName: string ) => {
	return queryOptions( {
		queryKey: [ 'read', 'list', userLogin, listName, 'items' ],
		queryFn: () => fetchReadListItems( userLogin, listName ),
		enabled: !! userLogin && !! listName,
		staleTime: 30 * 60000, // 30 minutes
	} );
};
