import { fetchDashboardSiteList, fetchDashboardSiteFilters } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';
import type {
	FetchSitesFilters,
	FetchDashboardSiteListParams,
	FetchDashboardSiteFiltersParams,
} from '@automattic/api-core';

export const dashboardSiteListQuery = (
	siteTypeFilters: FetchSitesFilters,
	params?: FetchDashboardSiteListParams
) =>
	queryOptions( {
		queryKey: [ 'dashboard-site-list', siteTypeFilters, params ],
		queryFn: () => fetchDashboardSiteList( siteTypeFilters, params ),
	} );

export const dashboardSiteFiltersQuery = (
	siteTypeFilters: FetchSitesFilters,
	fields: FetchDashboardSiteFiltersParams[ 'fields' ]
) =>
	queryOptions( {
		queryKey: [ 'dashboard-site-filters', siteTypeFilters, fields ],
		queryFn: () => fetchDashboardSiteFilters( siteTypeFilters, fields ),
	} );
