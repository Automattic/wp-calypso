import { fetchReadFeedSite } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const readFeedSiteQuery = ( siteId?: number ) => {
	return queryOptions( {
		queryKey: [ 'read', 'sites', siteId ],
		queryFn: () => fetchReadFeedSite( siteId! ),
		enabled: typeof siteId === 'number' && siteId > 0,
	} );
};
