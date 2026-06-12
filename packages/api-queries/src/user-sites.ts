import { fetchUserSites } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const userSitesQuery = ( userId: number ) => {
	return queryOptions( {
		queryKey: [ 'user', userId, 'sites' ],
		queryFn: () => fetchUserSites( userId ),
		staleTime: 5 * 60 * 1000, // 5 minutes
	} );
};
