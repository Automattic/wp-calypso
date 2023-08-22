import { SiteDetails } from '@automattic/data-stores/src/site';
import { UseQueryOptions, useQuery } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';

export const useSiteQuery = (
	sourceSiteSlug: string | number | null | undefined,
	options: UseQueryOptions< SiteDetails > = {}
) => {
	return useQuery( {
		queryKey: getSiteQueryKey( sourceSiteSlug ),
		queryFn: () =>
			wpcomRequest< SiteDetails >( {
				path: '/sites/' + encodeURIComponent( sourceSiteSlug ?? '' ),
			} ),
		meta: {
			persist: false,
		},
		...options,
		enabled: Boolean( sourceSiteSlug ) && options.enabled,
	} );
};

export function getSiteQueryKey( sourceSiteSlug: string | number | null | undefined ) {
	return [ 'site-details', sourceSiteSlug ];
}
