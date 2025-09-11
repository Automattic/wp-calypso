import {
	type CreateUpdateScheduleBody,
	type EditUpdateScheduleBody,
	type ScheduleUpdates,
	createSiteUpdateSchedule,
	editSiteUpdateSchedule,
	deleteSiteUpdateSchedule,
	fetchSiteUpdateSchedules,
} from '@automattic/api-core';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';

// Query: single-site schedules
export const siteScheduledUpdatesQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'scheduled-updates' ],
		queryFn: async () => {
			const response = await fetchSiteUpdateSchedules( siteId );
			// Convert map to array and attach id
			const list: ScheduleUpdates[] = Object.keys( response ).map( ( id ) => ( {
				...response[ id ],
				id,
			} ) );
			// Sort by timestamp ascending
			list.sort( ( a, b ) => ( a.timestamp ?? 0 ) - ( b.timestamp ?? 0 ) );
			return list;
		},
		retry: false,
		refetchOnWindowFocus: false,
	} );

// Mutation: create single-site schedule with optimistic update
export const siteScheduledUpdatesCreateMutation = ( siteId: number ) =>
	mutationOptions( {
		mutationFn: ( body: CreateUpdateScheduleBody ) => createSiteUpdateSchedule( siteId, body ),
		onMutate: ( body: CreateUpdateScheduleBody ) => {
			const key = siteScheduledUpdatesQuery( siteId ).queryKey;
			const previous = ( queryClient.getQueryData( key ) as ScheduleUpdates[] ) || [];
			const optimistic = [
				...previous,
				{
					id: 'temp-id',
					args: body.plugins,
					timestamp: body.schedule.timestamp,
					schedule: body.schedule.interval,
					// Keep parity with legacy optimistic field mapping
					interval: body.schedule.timestamp as unknown as number,
				} as unknown as ScheduleUpdates,
			];
			queryClient.setQueryData( key, optimistic );
			return { previous };
		},
		onError: ( _err, _vars, ctx ) => {
			const key = siteScheduledUpdatesQuery( siteId ).queryKey;
			if ( ctx?.previous ) {
				queryClient.setQueryData( key, ctx.previous );
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries( { queryKey: siteScheduledUpdatesQuery( siteId ).queryKey } );
		},
	} );

// Mutation: edit single-site schedule with optimistic update
export const siteScheduledUpdatesEditMutation = ( siteId: number ) =>
	mutationOptions( {
		mutationFn: ( variables: { scheduleId: string; body: EditUpdateScheduleBody } ) =>
			editSiteUpdateSchedule( siteId, variables.scheduleId, variables.body ),
		onMutate: ( variables: { scheduleId: string; body: EditUpdateScheduleBody } ) => {
			const key = siteScheduledUpdatesQuery( siteId ).queryKey;
			const previous = ( queryClient.getQueryData( key ) as ScheduleUpdates[] ) || [];
			const index = previous.findIndex( ( s ) => s.id === variables.scheduleId );
			if ( index === -1 ) {
				return { previous };
			}
			const updated = [
				...previous.slice( 0, index ),
				{
					...previous[ index ],
					args: variables.body.plugins,
					timestamp: variables.body.schedule.timestamp,
					schedule: variables.body.schedule.interval,
					interval: variables.body.schedule.timestamp as unknown as number,
				} as unknown as ScheduleUpdates,
				...previous.slice( index + 1 ),
			];
			queryClient.setQueryData( key, updated );
			return { previous };
		},
		onError: ( _err, _vars, ctx ) => {
			const key = siteScheduledUpdatesQuery( siteId ).queryKey;
			if ( ctx?.previous ) {
				queryClient.setQueryData( key, ctx.previous );
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries( { queryKey: siteScheduledUpdatesQuery( siteId ).queryKey } );
		},
	} );

// Mutation: delete single-site schedule with optimistic update
export const siteScheduledUpdatesDeleteMutation = ( siteId: number ) =>
	mutationOptions( {
		mutationFn: ( scheduleId: string ) => deleteSiteUpdateSchedule( siteId, scheduleId ),
		onMutate: ( scheduleId: string ) => {
			const key = siteScheduledUpdatesQuery( siteId ).queryKey;
			const previous = ( queryClient.getQueryData( key ) as ScheduleUpdates[] ) || [];
			queryClient.setQueryData(
				key,
				previous.filter( ( s ) => s.id !== scheduleId )
			);
			return { previous };
		},
		onError: ( _err, _vars, ctx ) => {
			const key = siteScheduledUpdatesQuery( siteId ).queryKey;
			if ( ctx?.previous ) {
				queryClient.setQueryData( key, ctx.previous );
			}
		},
	} );

// Batch create across multiple sites, mirroring legacy behavior
export const siteScheduledUpdatesBatchCreateMutation = ( siteIds: number[] ) =>
	mutationOptions( {
		mutationFn: async ( body: CreateUpdateScheduleBody ) => {
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
		onMutate: ( body: CreateUpdateScheduleBody ) => {
			const previous: Record< number, ScheduleUpdates[] > = {};
			siteIds.forEach( ( siteId ) => {
				const key = siteScheduledUpdatesQuery( siteId ).queryKey;
				const prev = ( queryClient.getQueryData( key ) as ScheduleUpdates[] ) || [];
				previous[ siteId ] = prev;
				const optimistic = [
					...prev,
					{
						id: 'temp-id',
						args: body.plugins,
						timestamp: body.schedule.timestamp,
						schedule: body.schedule.interval,
						interval: body.schedule.timestamp as unknown as number,
					} as unknown as ScheduleUpdates,
				];
				queryClient.setQueryData( key, optimistic );
			} );
			return { previous };
		},
		onError: ( _err, _vars, ctx ) => {
			const prev = ctx?.previous as Record< number, ScheduleUpdates[] > | undefined;
			if ( prev ) {
				Object.entries( prev ).forEach( ( [ siteId, list ] ) => {
					const key = siteScheduledUpdatesQuery( Number( siteId ) ).queryKey;
					queryClient.setQueryData( key, list );
				} );
			}
		},
		onSettled: () => {
			siteIds.forEach( ( siteId ) =>
				queryClient.invalidateQueries( { queryKey: siteScheduledUpdatesQuery( siteId ).queryKey } )
			);
		},
	} );
