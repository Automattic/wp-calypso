import { fetchReaderUserSites } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const getReaderUserSitesQuery = ( userId: number ) => {
	return queryOptions( {
		queryKey: [ 'reader', 'user', userId, 'get-sites' ],
		queryFn: () => fetchReaderUserSites( userId ),
		staleTime: 5 * 60 * 1000, // 5 minutes
	} );
};
