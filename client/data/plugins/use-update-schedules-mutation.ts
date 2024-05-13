import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import wpcomRequest from 'wpcom-proxy-request';
import type { ScheduleUpdates } from './use-update-schedules-query';
import type { SiteSlug } from 'calypso/types';

export type CreateRequestParams = {
	plugins: string[];
	schedule: {
		interval: 'daily' | 'weekly';
		timestamp: number;
	};
};

export function useCreateUpdateScheduleMutation( siteSlug: SiteSlug, queryOptions = {} ) {
	const queryClient = useQueryClient();

	const mutation = useMutation( {
		mutationKey: [ 'create-update-schedule', siteSlug ],
		mutationFn: ( params: object ) =>
			wpcomRequest( {
				path: `/sites/${ siteSlug }/update-schedules`,
				apiNamespace: 'wpcom/v2',
				method: 'POST',
				body: params,
			} ),
		onMutate: ( params: CreateRequestParams ) => {
			// Optimistically update the cache
			const prevSchedules: ScheduleUpdates[] =
				queryClient.getQueryData( [ 'schedule-updates', siteSlug ] ) || [];

			const newSchedules = [
				...prevSchedules,
				{
					id: 'temp-id',
					args: params.plugins,
					timestamp: params.schedule.timestamp,
					schedule: params.schedule.interval,
					interval: params.schedule.timestamp,
				},
			];

			queryClient.setQueryData( [ 'schedule-updates', siteSlug ], newSchedules );
			return { prevSchedules };
		},
		onError: ( err, params, context ) =>
			// Set previous value on error
			queryClient.setQueryData( [ 'schedule-updates', siteSlug ], context?.prevSchedules ),
		onSettled: () =>
			// Re-fetch after error or success
			queryClient.invalidateQueries( { queryKey: [ 'schedule-updates', siteSlug ] } ),
		...queryOptions,
	} );

	const { mutate } = mutation;
	const createUpdateSchedule = useCallback(
		( params: CreateRequestParams ) => mutate( params ),
		[ mutate ]
	);

	return { createUpdateSchedule, ...mutation };
}

export function useBatchCreateUpdateScheduleMutation( siteSlugs: SiteSlug[], queryOptions = {} ) {
	const queryClient = useQueryClient();

	const mutation = useMutation( {
		mutationKey: [ 'batch-create-update-schedule', ...siteSlugs ],
		mutationFn: async ( params: object ) => {
			const results: { siteSlug: string; response?: unknown; error?: unknown }[] =
				await Promise.all(
					siteSlugs.map( async ( siteSlug ) => {
						try {
							const response = await wpcomRequest( {
								path: `/sites/${ siteSlug }/update-schedules`,
								apiNamespace: 'wpcom/v2',
								method: 'POST',
								body: params,
							} );
							return { siteSlug, response };
						} catch ( error ) {
							return { siteSlug, error };
						}
					} )
				);

			return results;
		},
		onSettled: () => {
			queryClient.removeQueries( { queryKey: [ 'multisite-schedules-update' ] } );

			siteSlugs.forEach( ( siteSlug ) => {
				queryClient.removeQueries( { queryKey: [ 'schedule-updates', siteSlug ] } );
			} );
		},
		...queryOptions,
	} );

	const { mutate } = mutation;
	const createUpdateSchedule = useCallback(
		( params: CreateRequestParams ) => mutate( params ),
		[ mutate ]
	);

	return { createUpdateSchedule, ...mutation };
}

export function useEditUpdateScheduleMutation( siteSlug: SiteSlug, queryOptions = {} ) {
	const queryClient = useQueryClient();

	const mutation = useMutation( {
		mutationKey: [ 'edit-update-schedule', siteSlug ],
		mutationFn: ( obj: { id: string; params: object } ) => {
			const { id, params } = obj;

			return wpcomRequest( {
				path: `/sites/${ siteSlug }/update-schedules/${ id }`,
				apiNamespace: 'wpcom/v2',
				method: 'PUT',
				body: params,
			} );
		},
		onMutate: ( props ) => {
			const id = props.id;
			const params = props.params as CreateRequestParams;

			const prevSchedules: ScheduleUpdates[] =
				queryClient.getQueryData( [ 'schedule-updates', siteSlug ] ) || [];
			const scheduleIndex = prevSchedules.findIndex( ( x ) => x.id === id );

			// Replace schedule with new data without mutating the original array
			const newSchedules = [
				...prevSchedules.slice( 0, scheduleIndex ),
				{
					...prevSchedules[ scheduleIndex ],
					args: params.plugins,
					timestamp: params.schedule.timestamp,
					schedule: params.schedule.interval,
					interval: params.schedule.timestamp,
				},
				...prevSchedules.slice( scheduleIndex + 1 ),
			];

			queryClient.setQueryData( [ 'schedule-updates', siteSlug ], newSchedules );
			return { prevSchedules };
		},
		onError: ( err, params, context ) =>
			// Set previous value on error
			queryClient.setQueryData( [ 'schedule-updates', siteSlug ], context?.prevSchedules ),
		onSettled: () =>
			// Re-fetch after error or success
			queryClient.invalidateQueries( { queryKey: [ 'schedule-updates', siteSlug ] } ),
		...queryOptions,
	} );

	const { mutate } = mutation;
	const editUpdateSchedule = useCallback(
		( id: string, params: object ) => mutate( { id, params } ),
		[ mutate ]
	);

	return { editUpdateSchedule, ...mutation };
}

export function useBatchEditUpdateScheduleMutation( siteSlugs: SiteSlug[], queryOptions = {} ) {
	const queryClient = useQueryClient();

	const mutation = useMutation( {
		mutationKey: [ 'batch-edit-update-schedule', ...siteSlugs ],
		mutationFn: async ( obj: { id: string; params: object } ) => {
			const { id, params } = obj;

			const results: { siteSlug: string; response?: unknown; error?: unknown }[] =
				await Promise.all(
					siteSlugs.map( async ( siteSlug ) => {
						try {
							const response = await wpcomRequest( {
								path: `/sites/${ siteSlug }/update-schedules/${ id }`,
								apiNamespace: 'wpcom/v2',
								method: 'PUT',
								body: params,
							} );
							return { siteSlug, response };
						} catch ( error ) {
							return { siteSlug, error };
						}
					} )
				);

			return results;
		},
		onSettled: () => {
			queryClient.removeQueries( { queryKey: [ 'multisite-schedules-update' ] } );

			siteSlugs.forEach( ( siteSlug ) => {
				queryClient.removeQueries( { queryKey: [ 'schedule-updates', siteSlug ] } );
			} );
		},
		...queryOptions,
	} );

	const { mutate } = mutation;
	const editUpdateSchedule = useCallback(
		( id: string, params: object ) => mutate( { id, params } ),
		[ mutate ]
	);

	return { editUpdateSchedule, ...mutation };
}

export function useDeleteUpdateScheduleMutation( siteSlug: SiteSlug, queryOptions = {} ) {
	const queryClient = useQueryClient();

	const mutation = useMutation( {
		mutationFn: ( id: string ) =>
			wpcomRequest( {
				path: `/sites/${ siteSlug }/update-schedules/${ id }`,
				apiNamespace: 'wpcom/v2',
				method: 'DELETE',
			} ),
		onMutate: ( id ) => {
			// Optimistically update the cache
			const prevSchedules: ScheduleUpdates[] =
				queryClient.getQueryData( [ 'schedule-updates', siteSlug ] ) || [];
			const schedules = prevSchedules.filter( ( x ) => x.id !== id );
			queryClient.setQueryData( [ 'schedule-updates', siteSlug ], schedules );
		},
		...queryOptions,
	} );

	const { mutate } = mutation;
	const deleteUpdateSchedule = useCallback( ( id: string ) => mutate( id ), [ mutate ] );

	return { deleteUpdateSchedule, ...mutation };
}

export function useBatchDeleteUpdateScheduleMutation( siteSlugs: SiteSlug[], queryOptions = {} ) {
	const queryClient = useQueryClient();

	const mutation = useMutation( {
		mutationFn: async ( id: string ) => {
			const results: { siteSlug: string; response?: unknown; error?: unknown }[] =
				await Promise.all(
					siteSlugs.map( async ( siteSlug ) => {
						try {
							const response = await wpcomRequest( {
								path: `/sites/${ siteSlug }/update-schedules/${ id }`,
								apiNamespace: 'wpcom/v2',
								method: 'DELETE',
							} );
							return { siteSlug, response };
						} catch ( error ) {
							return { siteSlug, error };
						}
					} )
				);

			return results;
		},
		onSettled: () => {
			queryClient.removeQueries( { queryKey: [ 'multisite-schedules-update' ] } );

			siteSlugs.forEach( ( siteSlug ) => {
				queryClient.removeQueries( { queryKey: [ 'schedule-updates', siteSlug ] } );
			} );
		},
		...queryOptions,
	} );

	const { mutate } = mutation;
	const deleteUpdateSchedule = useCallback( ( id: string ) => mutate( id ), [ mutate ] );

	return { deleteUpdateSchedule, ...mutation };
}
