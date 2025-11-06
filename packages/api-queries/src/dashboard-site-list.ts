import { fetchDashboardSiteList } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';
import type { FetchDashboardSiteListParams } from '@automattic/api-core';

export const dashboardSiteListQuery = ( params?: FetchDashboardSiteListParams ) =>
	queryOptions( {
		queryKey: [ 'dashboard-site-list', params ],
		queryFn: () => fetchDashboardSiteList( params ),
	} );
