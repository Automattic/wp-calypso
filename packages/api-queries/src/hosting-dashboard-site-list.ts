import { fetchHostingDashboardSiteList } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';
import type { HostingDashboardSiteListParams } from '@automattic/api-core';

export const hostingDashboardSiteListQuery = ( params: HostingDashboardSiteListParams ) =>
	queryOptions( {
		queryKey: [ 'hosting-dashboard-site-list', params ],
		queryFn: () => fetchHostingDashboardSiteList( params ),
	} );
