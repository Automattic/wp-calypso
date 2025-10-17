import {
	type CreateSiteUpdateScheduleBody,
	type EditSiteUpdateScheduleBody,
	type UpdateSchedule,
	createSiteUpdateSchedule,
	editSiteUpdateSchedule,
	deleteSiteUpdateSchedule,
	fetchSiteUpdateSchedules,
} from '@automattic/api-core';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';

// Query: single-site schedules
export const siteUpdateSchedulesQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'update-schedules' ],
		queryFn: async () => {
			const response = await fetchSiteUpdateSchedules( siteId );

			return (
				Object.entries( response )
					// Convert map to array and attach id
					.map( ( [ id, update ] ) => ( { ...update, id } ) as UpdateSchedule )
					// Sort by timestamp ascending
					.sort( ( a, b ) => ( a.timestamp ?? 0 ) - ( b.timestamp ?? 0 ) )
			);
		},
	} );

const invalidateSiteUpdateSchedules = ( siteId: number ) => {
	queryClient.invalidateQueries( siteUpdateSchedulesQuery( siteId ) );
};

// Mutation: create single-site schedule
export const siteUpdateScheduleCreateMutation = ( siteId: number ) =>
	mutationOptions( {
		mutationFn: ( body: CreateSiteUpdateScheduleBody ) => createSiteUpdateSchedule( siteId, body ),
		onSuccess: () => {
			invalidateSiteUpdateSchedules( siteId );
		},
	} );

// Mutation: edit single-site schedule
export const siteUpdateScheduleEditMutation = ( siteId: number ) =>
	mutationOptions( {
		mutationFn: ( variables: { scheduleId: string; body: EditSiteUpdateScheduleBody } ) =>
			editSiteUpdateSchedule( siteId, variables.scheduleId, variables.body ),
		onSuccess: () => {
			invalidateSiteUpdateSchedules( siteId );
		},
	} );

// Mutation: delete single-site schedule
export const siteUpdateScheduleDeleteMutation = ( siteId: number ) =>
	mutationOptions( {
		mutationFn: ( scheduleId: string ) => deleteSiteUpdateSchedule( siteId, scheduleId ),
		onSuccess: () => {
			invalidateSiteUpdateSchedules( siteId );
		},
	} );

// Batch create across multiple sites
export const updateSchedulesBatchCreateMutation = ( siteIds: number[] ) =>
	mutationOptions( {
		mutationFn: async ( body: CreateSiteUpdateScheduleBody ) => {
			const results = await Promise.all(
				siteIds.map( async ( siteId ) => {
					try {
						const response = await createSiteUpdateSchedule( siteId, body );
						return { siteId, response } as const;
					} catch ( error ) {
						return { siteId, error } as const;
					}
				} )
			);
			return results;
		},
		onSuccess: () => {
			siteIds.forEach( ( siteId ) => invalidateSiteUpdateSchedules( siteId ) );
		},
	} );
