import { fetchSites, fetchPaginatedSites, SITE_FIELDS, SITE_OPTIONS } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';
import type {
	FetchSiteTypes,
	FetchSitesOptions,
	FetchPaginatedSitesOptions,
} from '@automattic/api-core';

export const sitesQueryKey = [ 'sites', SITE_FIELDS, SITE_OPTIONS ];

export const sitesQuery = (
	siteFilters: FetchSiteTypes,
	fetchSitesOptions: FetchSitesOptions = { site_visibility: 'visible', include_a8c_owned: false }
) => {
	const { source, ...fetchSitesOptionsKey } = fetchSitesOptions;
	return queryOptions( {
		queryKey: [ ...sitesQueryKey, siteFilters, fetchSitesOptionsKey ],
		queryFn: () => fetchSites( siteFilters, fetchSitesOptions ),
	} );
};

// Filters in the queryFn rather than via `select` or the endpoint's `filters`
// param: consumers may provide their own `select`, and the server-side
// `filters=jetpack` semantics don't exactly match `site.jetpack` (e.g. Atomic).
export const jetpackSitesQuery = (
	fetchSitesOptions: FetchSitesOptions = { site_visibility: 'visible', include_a8c_owned: false }
) => {
	const { source, ...fetchSitesOptionsKey } = fetchSitesOptions;
	return queryOptions( {
		queryKey: [ ...sitesQueryKey, 'jetpack-connected', fetchSitesOptionsKey ],
		queryFn: async () =>
			( await fetchSites( 'all', fetchSitesOptions ) ).filter( ( site ) => site.jetpack ),
	} );
};

export const paginatedSitesQuery = (
	siteFilters: FetchSiteTypes,
	fetchSitesOptions: FetchPaginatedSitesOptions = {
		site_visibility: 'visible',
		include_a8c_owned: false,
	}
) => {
	const { source, ...fetchSitesOptionsKey } = fetchSitesOptions;
	return queryOptions( {
		queryKey: [ ...sitesQueryKey, 'paginated', siteFilters, fetchSitesOptionsKey ],
		queryFn: () => fetchPaginatedSites( siteFilters, fetchSitesOptions ),
	} );
};

export const allSitesQuery = () => sitesQuery( 'all' );
