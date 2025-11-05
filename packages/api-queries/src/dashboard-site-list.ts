import { fetchDashboardSiteList } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';
import type { DashboardSiteListParams } from '@automattic/api-core';

export const dashboardSiteListQuery = ( params: DashboardSiteListParams ) =>
	queryOptions( {
		queryKey: [ 'dashboard-site-list', params ],
		queryFn: () => fetchDashboardSiteList( params ),
	} );
