import { fetchHostingUpdateSchedules, deleteHostingUpdateSchedule } from '@automattic/api-core';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';

// Query: hosting (multi-site) schedules
export const hostingUpdateSchedulesQuery = () =>
	queryOptions( {
		queryKey: [ 'hosting', 'update-schedules' ],
		queryFn: () => fetchHostingUpdateSchedules(),
	} );

// Mutation: delete hosting update schedule
export const hostingUpdateScheduleDeleteMutation = () =>
	mutationOptions( {
		mutationFn: ( variables: { siteId: number; scheduleId: string } ) =>
			deleteHostingUpdateSchedule( variables.siteId, variables.scheduleId ),
		onSuccess: () => {
			queryClient.invalidateQueries( { queryKey: [ 'hosting', 'update-schedules' ] } );
		},
	} );
