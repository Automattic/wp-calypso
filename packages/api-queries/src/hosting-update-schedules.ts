import { fetchHostingUpdateSchedules } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

// Query: hosting (multi-site) schedules
export const hostingUpdateSchedulesQuery = () =>
	queryOptions( {
		queryKey: [ 'hosting', 'update-schedules' ],
		queryFn: () => fetchHostingUpdateSchedules(),
	} );
