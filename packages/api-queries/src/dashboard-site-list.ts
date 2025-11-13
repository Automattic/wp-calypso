import { fetchDashboardSiteList, fetchDashboardSiteFilters } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';
import type { FetchDashboardSiteListParams, DashboardFilters } from '@automattic/api-core';

export const dashboardSiteListQuery = ( params?: FetchDashboardSiteListParams ) =>
	queryOptions( {
		queryKey: [ 'dashboard-site-list', params ],
		queryFn: () => fetchDashboardSiteList( params ),
	} );

export const dashboardSiteFiltersQuery = ( field: keyof DashboardFilters ) =>
	queryOptions( {
		queryKey: [ 'dashboard-site-filters', field ],
		queryFn: () => fetchDashboardSiteFilters( field ),
	} );
