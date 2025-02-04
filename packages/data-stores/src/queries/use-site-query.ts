import { SiteDetails } from '@automattic/data-stores/src/site';
import { UseQueryOptions, useQuery } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';

export function useSiteQuery< TError = unknown, TData = SiteDetails >(
	sourceSiteSlug: string | number | null | undefined,
	options: Omit< UseQueryOptions< SiteDetails, TError, TData >, 'queryKey' > = {}
) {
	return useQuery( {
		queryFn: () =>
			wpcomRequest< SiteDetails >( {
				path: '/sites/' + encodeURIComponent( sourceSiteSlug ?? '' ),
			} ),
		meta: {
			persist: false,
		},
		...options,
		queryKey: getSiteQueryKey( sourceSiteSlug ),
		enabled: Boolean( sourceSiteSlug ) && options.enabled,
	} );
}

export function getSiteQueryKey( sourceSiteSlug: string | number | null | undefined ) {
	return [ 'site-details', sourceSiteSlug ];
}
