import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import wpcomRequest from 'wpcom-proxy-request';
import type { ScheduleUpdates } from './use-update-schedules-query';
import type { SiteSlug } from 'calypso/types';

export function useCreateUpdateScheduleMutation( siteSlug: SiteSlug, queryOptions = {} ) {
	const mutation = useMutation( {
		mutationKey: [ 'create-update-schedule', siteSlug ],
		mutationFn: ( params: object ) =>
			wpcomRequest( {
				path: `/sites/${ siteSlug }/update-schedules`,
				apiNamespace: 'wpcom/v2',
				method: 'POST',
				body: params,
			} ),
		...queryOptions,
	} );

	const { mutate } = mutation;
	const createUpdateSchedule = useCallback( ( params: object ) => mutate( params ), [ mutate ] );

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

export function useDeleteScheduleUpdatesMutation( siteSlug: SiteSlug, queryOptions = {} ) {
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
	const deleteScheduleUpdates = useCallback( ( id: string ) => mutate( id ), [ mutate ] );

	return { deleteScheduleUpdates, ...mutation };
}
