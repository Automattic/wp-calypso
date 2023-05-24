import { useQuery, UseQueryResult, QueryKey } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import type { SiteVerticalsResponse } from './types';

const useSiteVerticalsFeatured = (): UseQueryResult< SiteVerticalsResponse[] > => {
	return useQuery( {
		queryKey: getCacheKey(),
		queryFn: () => fetchSiteVerticalsFeatured(),
		enabled: true,
		staleTime: Infinity,
		refetchInterval: false,
	} );
};

export function fetchSiteVerticalsFeatured(): Promise< SiteVerticalsResponse[] > {
	return wpcom.req.get( {
		apiNamespace: 'wpcom/v2',
		path: '/site-verticals/featured',
	} );
}

export function getCacheKey(): QueryKey {
	return [ 'site-verticals', 'featured' ];
}

export default useSiteVerticalsFeatured;
