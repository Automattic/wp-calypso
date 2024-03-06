import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import wpcomRequest from 'wpcom-proxy-request';
import type { ScheduleUpdates } from './use-update-schedules-query';
import type { SiteSlug } from 'calypso/types';

export type CreateRequestParams = {
	hook: string;
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
					hook: params.hook,
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

export function useEditUpdateScheduleMutation( siteSlug: SiteSlug, queryOptions = {} ) {
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
