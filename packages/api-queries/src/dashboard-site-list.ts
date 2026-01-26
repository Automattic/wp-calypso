import { fetchDashboardSiteFilters } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';
import type { FetchSiteTypes, FetchDashboardSiteFiltersParams } from '@automattic/api-core';

export const dashboardSiteFiltersQuery = (
	siteTypes: FetchSiteTypes,
	fields: FetchDashboardSiteFiltersParams[ 'fields' ]
) =>
	queryOptions( {
		queryKey: [ 'dashboard-site-filters', siteTypes, fields ],
		queryFn: () => fetchDashboardSiteFilters( siteTypes, fields ),
	} );
