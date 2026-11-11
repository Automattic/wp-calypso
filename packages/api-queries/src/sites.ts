import { fetchSites, fetchPaginatedSites, SITE_FIELDS, SITE_OPTIONS } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';
import { withPrototypeOverride } from './prototype-overrides';
import type {
	FetchSiteTypes,
	FetchSitesOptions,
	FetchPaginatedSitesOptions,
} from '@automattic/api-core';

export const sitesQueryKey = [ 'sites', SITE_FIELDS, SITE_OPTIONS ];

export const sitesQuery = (
	siteFilters: FetchSiteTypes = 'all',
	fetchSitesOptions: FetchSitesOptions = { site_visibility: 'visible', include_a8c_owned: false }
) => {
	const { source, ...fetchSitesOptionsKey } = fetchSitesOptions;
	return queryOptions( {
		queryKey: [ ...sitesQueryKey, siteFilters, fetchSitesOptionsKey ],
		// Prototype: only the default list (visible sites) carries the mock sites.
		queryFn:
			siteFilters === 'all' && fetchSitesOptions.site_visibility !== 'deleted'
				? withPrototypeOverride( 'sites', () => fetchSites( siteFilters, fetchSitesOptions ) )
				: () => fetchSites( siteFilters, fetchSitesOptions ),
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
		queryFn:
			siteFilters === 'all' && fetchSitesOptions.site_visibility !== 'deleted'
				? withPrototypeOverride( 'paginatedSites', () =>
						fetchPaginatedSites( siteFilters, fetchSitesOptions )
					)
				: () => fetchPaginatedSites( siteFilters, fetchSitesOptions ),
	} );
};

export const hasDeletedSitesQuery = () =>
	queryOptions( {
		...paginatedSitesQuery( 'all', {
			site_visibility: 'deleted',
			include_a8c_owned: false,
			per_page: 1,
		} ),
		select: ( data ) => data.total > 0,
	} );
