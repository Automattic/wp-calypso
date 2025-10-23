import { fetchSites, SITE_FIELDS, SITE_OPTIONS } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';
import type { FetchSitesFilters, FetchSitesOptions } from '@automattic/api-core';
import type { Query } from '@tanstack/react-query';

const DEFAULT_QUERY_KEYS = [ 'sites', SITE_FIELDS, SITE_OPTIONS ];

export const sitesQuery = (
	siteFilters: FetchSitesFilters,
	fetchSitesOptions: FetchSitesOptions = { site_visibility: 'visible', include_a8c_owned: false }
) =>
	queryOptions( {
		queryKey: [ ...DEFAULT_QUERY_KEYS, siteFilters, fetchSitesOptions ],
		queryFn: () => fetchSites( siteFilters, fetchSitesOptions ),
	} );

export const sitesQueryFilter = () => ( {
	predicate: ( { queryKey }: Query ) => {
		return DEFAULT_QUERY_KEYS.every( ( value, i ) => value === queryKey[ i ] );
	},
} );
