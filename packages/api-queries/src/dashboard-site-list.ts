import { fetchDashboardSiteList, fetchDashboardSiteFilters } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';
import type {
	FetchSiteTypes,
	FetchDashboardSiteListParams,
	FetchDashboardSiteFiltersParams,
} from '@automattic/api-core';

export const dashboardSiteListQuery = (
	siteTypes: FetchSiteTypes,
	params?: FetchDashboardSiteListParams
) =>
	queryOptions( {
		queryKey: [ 'dashboard-site-list', siteTypes, params ],
		queryFn: () => fetchDashboardSiteList( siteTypes, params ),
	} );

export const dashboardSiteFiltersQuery = (
	siteTypes: FetchSiteTypes,
	fields: FetchDashboardSiteFiltersParams[ 'fields' ]
) =>
	queryOptions( {
		queryKey: [ 'dashboard-site-filters', siteTypes, fields ],
		queryFn: () => fetchDashboardSiteFilters( siteTypes, fields ),
	} );
