import { fetchDifmWebsiteContent } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const siteDifmWebsiteContentQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'difm-website-content' ],
		queryFn: () => fetchDifmWebsiteContent( siteId ),
		meta: { persist: false },
		staleTime: Infinity,
	} );
