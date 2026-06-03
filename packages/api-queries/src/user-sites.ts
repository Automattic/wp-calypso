import { fetchUserSites } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const userSitesQuery = ( userId: number, { owner }: { owner?: boolean } = {} ) => {
	return queryOptions( {
		// The owner-scoped list (annotated with `is_hidden`, includes hidden sites) is cached
		// separately from the public list so the two never overwrite each other.
		queryKey: [ 'user', userId, 'sites', owner ? 'owner' : 'public' ],
		queryFn: () => fetchUserSites( userId, { owner } ),
		staleTime: 5 * 60 * 1000, // 5 minutes
	} );
};
