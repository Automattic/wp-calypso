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
	fetchSitesOptions: Partial< FetchSitesOptions > = {}
) => {
	const withDefaults: FetchSitesOptions = {
		site_visibility: 'visible',
		include_a8c_owned: false,
		include_staging: false,
		...fetchSitesOptions,
	};
	const { source, ...fetchSitesOptionsKey } = withDefaults;
	return queryOptions( {
		queryKey: [ ...sitesQueryKey, siteFilters, fetchSitesOptionsKey ],
		queryFn: () => fetchSites( siteFilters, withDefaults ),
	} );
};

export const paginatedSitesQuery = (
	siteFilters: FetchSiteTypes,
	fetchSitesOptions: Partial< FetchPaginatedSitesOptions > = {}
) => {
	const withDefaults: FetchPaginatedSitesOptions = {
		site_visibility: 'visible',
		include_a8c_owned: false,
		include_staging: false,
		...fetchSitesOptions,
	};
	const { source, ...fetchSitesOptionsKey } = withDefaults;
	return queryOptions( {
		queryKey: [ ...sitesQueryKey, 'paginated', siteFilters, fetchSitesOptionsKey ],
		queryFn: () => fetchPaginatedSites( siteFilters, withDefaults ),
	} );
};

export const allSitesQuery = () => sitesQuery( 'all' );
