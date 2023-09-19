import { SiteDetails } from '@automattic/data-stores/src/site';
import { UseQueryOptions, useQuery } from '@tanstack/react-query';
import wp from 'calypso/lib/wp'; // eslint-disable-line no-restricted-imports

export function useSiteQuery< TError = unknown, TData = SiteDetails >(
	sourceSiteSlug: string | number | null | undefined,
	options: UseQueryOptions< SiteDetails, TError, TData > = {}
) {
	return useQuery( {
		queryKey: getSiteQueryKey( sourceSiteSlug ),
		queryFn: () => wp.req.get( { path: '/sites/' + encodeURIComponent( sourceSiteSlug ?? '' ) } ),
		meta: {
			persist: false,
		},
		...options,
		enabled: Boolean( sourceSiteSlug ) && options.enabled,
	} );
}

export function getSiteQueryKey( sourceSiteSlug: string | number | null | undefined ) {
	return [ 'site-details', sourceSiteSlug ];
}
