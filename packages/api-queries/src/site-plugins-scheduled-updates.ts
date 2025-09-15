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
			// Convert map to array and attach id
			const list: ScheduledUpdate[] = Object.keys( response ).map( ( id ) => ( {
				...response[ id ],
				id,
			} ) );
			// Sort by timestamp ascending
			list.sort( ( a, b ) => ( a.timestamp ?? 0 ) - ( b.timestamp ?? 0 ) );
			return list;
		},
	} );

// Mutation: create single-site schedule with optimistic update
export const siteScheduledUpdatesCreateMutation = ( siteId: number ) =>
	mutationOptions( {
		mutationFn: ( body: CreateScheduledUpdateBody ) => createSiteScheduledUpdate( siteId, body ),
		onMutate: ( body: CreateScheduledUpdateBody ) => {
			const key = siteScheduledUpdatesQuery( siteId ).queryKey;
			const previous = ( queryClient.getQueryData( key ) as ScheduledUpdate[] ) || [];
			const optimistic = [
				...previous,
				{
					id: 'temp-id',
					args: body.plugins,
					timestamp: body.schedule.timestamp,
					schedule: body.schedule.interval,
					// Keep parity with legacy optimistic field mapping
					interval: body.schedule.timestamp as unknown as number,
				} as unknown as ScheduledUpdate,
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
		mutationFn: ( variables: { scheduleId: string; body: EditScheduledUpdateBody } ) =>
			editSiteScheduledUpdate( siteId, variables.scheduleId, variables.body ),
		onMutate: ( variables: { scheduleId: string; body: EditScheduledUpdateBody } ) => {
			const key = siteScheduledUpdatesQuery( siteId ).queryKey;
			const previous = ( queryClient.getQueryData( key ) as ScheduledUpdate[] ) || [];
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
				} as unknown as ScheduledUpdate,
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
		mutationFn: ( scheduleId: string ) => deleteSiteScheduledUpdate( siteId, scheduleId ),
		onMutate: ( scheduleId: string ) => {
			const key = siteScheduledUpdatesQuery( siteId ).queryKey;
			const previous = ( queryClient.getQueryData( key ) as ScheduledUpdate[] ) || [];
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
		onMutate: ( body: CreateScheduledUpdateBody ) => {
			const previous: Record< number, ScheduledUpdate[] > = {};
			siteIds.forEach( ( siteId ) => {
				const key = siteScheduledUpdatesQuery( siteId ).queryKey;
				const prev = ( queryClient.getQueryData( key ) as ScheduledUpdate[] ) || [];
				previous[ siteId ] = prev;
				const optimistic = [
					...prev,
					{
						id: 'temp-id',
						args: body.plugins,
						timestamp: body.schedule.timestamp,
						schedule: body.schedule.interval,
						interval: body.schedule.timestamp as unknown as number,
					} as unknown as ScheduledUpdate,
				];
				queryClient.setQueryData( key, optimistic );
			} );
			return { previous };
		},
		onError: ( _err, _vars, ctx ) => {
			const prev = ctx?.previous as Record< number, ScheduledUpdate[] > | undefined;
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
