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
		onMutate: ( variables: { siteId: number; scheduleId: string } ) => {
			// Optimistically update the cache
			const data = queryClient.getQueryData( hostingUpdateSchedulesQuery().queryKey );
			if ( data && typeof data === 'object' && 'sites' in data ) {
				const prevData = JSON.parse( JSON.stringify( data ) ); // deep copy
				const sites = ( data as any ).sites || {};

				// Remove the schedule from the site
				if ( sites[ variables.siteId ] ) {
					delete sites[ variables.siteId ][ variables.scheduleId ];
				}

				queryClient.setQueryData( hostingUpdateSchedulesQuery().queryKey, { ...data, sites } );
				return { prevData };
			}
		},
		onError: ( error, variables, context ) => {
			// Rollback on error
			if ( context?.prevData ) {
				queryClient.setQueryData( hostingUpdateSchedulesQuery().queryKey, context.prevData );
			}
		},
		onSuccess: () => {
			// Delay cache invalidation to allow server to process the deletion and get fresh data
			setTimeout( () => {
				queryClient.invalidateQueries( hostingUpdateSchedulesQuery() );
			}, 5000 );
		},
	} );
