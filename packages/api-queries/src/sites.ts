import { fetchSites, SITE_FIELDS, SITE_OPTIONS } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';
import type { FetchSitesOptions } from '@automattic/api-core';

export const sitesQuery = (
	fetchSitesOptions: FetchSitesOptions = { site_visibility: 'visible', include_a8c_owned: false }
) =>
	queryOptions( {
		queryKey: [ 'sites', SITE_FIELDS, SITE_OPTIONS, fetchSitesOptions ],
		queryFn: () => fetchSites( fetchSitesOptions ),
	} );
