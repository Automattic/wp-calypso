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
	const withDefaults = { include_staging: false, ...fetchSitesOptions };
	const { source, ...fetchSitesOptionsKey } = withDefaults;
	return queryOptions( {
		queryKey: [ ...sitesQueryKey, siteFilters, fetchSitesOptionsKey ],
		queryFn: () => fetchSites( siteFilters, withDefaults ),
	} );
};

export const paginatedSitesQuery = (
	siteFilters: FetchSiteTypes,
	fetchSitesOptions: FetchPaginatedSitesOptions = {
		site_visibility: 'visible',
		include_a8c_owned: false,
	}
) => {
	const withDefaults = { include_staging: false, ...fetchSitesOptions };
	const { source, ...fetchSitesOptionsKey } = withDefaults;
	return queryOptions( {
		queryKey: [ ...sitesQueryKey, 'paginated', siteFilters, fetchSitesOptionsKey ],
		queryFn: () => fetchPaginatedSites( siteFilters, withDefaults ),
	} );
};

export const allSitesQuery = () => sitesQuery( 'all' );
