import { fetchUserSites } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const userSitesQuery = ( userId: number, params: { owner?: boolean } = {} ) => {
	return queryOptions( {
		queryKey: [ 'user', userId, 'sites', params ],
		queryFn: () => fetchUserSites( userId, params ),
		staleTime: 5 * 60 * 1000, // 5 minutes
	} );
};
