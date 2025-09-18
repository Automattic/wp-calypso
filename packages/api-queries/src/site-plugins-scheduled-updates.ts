import {
	type CreateScheduledUpdateBody,
	type EditScheduledUpdateBody,
	type ScheduledUpdate,
	createSiteScheduledUpdate,
	editSiteScheduledUpdate,
	deleteSiteScheduledUpdate,
	fetchSiteScheduledUpdates,
} from '@automattic/api-core';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';

// Query: single-site schedules
export const siteScheduledUpdatesQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'scheduled-updates' ],
		queryFn: async () => {
			const response = await fetchSiteScheduledUpdates( siteId );

			return (
				Object.entries( response )
					// Convert map to array and attach id
					.map( ( [ id, update ] ) => ( { ...update, id } ) as ScheduledUpdate )
					// Sort by timestamp ascending
					.sort( ( a, b ) => ( a.timestamp ?? 0 ) - ( b.timestamp ?? 0 ) )
			);
		},
	} );

const invalidateSiteScheduledUpdates = ( siteId: number ) => {
	queryClient.invalidateQueries( siteScheduledUpdatesQuery( siteId ) );
};

// Mutation: create single-site schedule
export const siteScheduledUpdatesCreateMutation = ( siteId: number ) =>
	mutationOptions( {
		mutationFn: ( body: CreateScheduledUpdateBody ) => createSiteScheduledUpdate( siteId, body ),
		onSuccess: () => {
			invalidateSiteScheduledUpdates( siteId );
		},
	} );

// Mutation: edit single-site schedule
export const siteScheduledUpdatesEditMutation = ( siteId: number ) =>
	mutationOptions( {
		mutationFn: ( variables: { scheduleId: string; body: EditScheduledUpdateBody } ) =>
			editSiteScheduledUpdate( siteId, variables.scheduleId, variables.body ),
		onSuccess: () => {
			invalidateSiteScheduledUpdates( siteId );
		},
	} );

// Mutation: delete single-site schedule
export const siteScheduledUpdatesDeleteMutation = ( siteId: number ) =>
	mutationOptions( {
		mutationFn: ( scheduleId: string ) => deleteSiteScheduledUpdate( siteId, scheduleId ),
		onSuccess: () => {
			invalidateSiteScheduledUpdates( siteId );
		},
	} );

// Batch create across multiple sites
export const siteScheduledUpdatesBatchCreateMutation = ( siteIds: number[] ) =>
	mutationOptions( {
		mutationFn: async ( body: CreateScheduledUpdateBody ) => {
			const results = await Promise.all(
				siteIds.map( async ( siteId ) => {
					try {
						const response = await createSiteScheduledUpdate( siteId, body );
						return { siteId, response } as const;
					} catch ( error ) {
						return { siteId, error } as const;
					}
				} )
			);
			return results;
		},
		onSuccess: () => {
			siteIds.forEach( ( siteId ) => invalidateSiteScheduledUpdates( siteId ) );
		},
	} );
