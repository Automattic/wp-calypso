import { useQuery, UseQueryResult, QueryKey } from 'react-query';
import wpcom from 'calypso/lib/wp';
import type { SiteVerticalsResponse } from './types';

const useSiteVerticalsFeatured = ( {
	locale = 'en',
} ): UseQueryResult< SiteVerticalsResponse[] > => {
	return useQuery( getCacheKey( locale ), () => fetchSiteVerticalsFeatured( locale ), {
		enabled: true,
		staleTime: Infinity,
		refetchInterval: false,
	} );
};

export function fetchSiteVerticalsFeatured( locale: string ): Promise< SiteVerticalsResponse[] > {
	return wpcom.req.get(
		{
			apiNamespace: 'wpcom/v2',
			path: '/site-verticals/featured',
		},
		{ _locale: locale }
	);
}

export function getCacheKey( locale: string ): QueryKey {
	return [ 'site-verticals', 'featured', locale ];
}

export default useSiteVerticalsFeatured;
