import { useQuery, UseQueryResult, QueryKey } from 'react-query';
import wpcom from 'calypso/lib/wp';
import type { SiteVerticalsResponse } from './types';

const useSiteVerticalsFeatured = ( seed?: string ): UseQueryResult< SiteVerticalsResponse[] > => {
	return useQuery( getCacheKey( seed ), () => fetchSiteVerticalsFeatured( seed ), {
		enabled: true,
		staleTime: Infinity,
		refetchInterval: false,
	} );
};

export function fetchSiteVerticalsFeatured( seed?: string ): Promise< SiteVerticalsResponse[] > {
	return wpcom.req.get(
		{
			apiNamespace: 'wpcom/v2',
			path: '/site-verticals/featured',
		},
		{ seed }
	);
}

export function getCacheKey( seed?: string ): QueryKey {
	return [ 'site-verticals', 'featured', seed ];
}

export default useSiteVerticalsFeatured;
