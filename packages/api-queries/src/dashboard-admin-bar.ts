import { fetchDashboardAdminBar } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const dashboardAdminBarQuery = () =>
	queryOptions( {
		queryKey: [ 'dashboard-admin-bar' ],
		queryFn: fetchDashboardAdminBar,
	} );
