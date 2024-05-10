import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import wpcomRequest from 'wpcom-proxy-request';
import type {
	ScheduleUpdates,
	MultisiteSchedulesUpdatesResponse,
} from 'calypso/data/plugins/use-update-schedules-query';
import type { SiteSlug } from 'calypso/types';

export type ActiveRequestParams = {
	active: boolean;
};

interface IStringIndex extends Record< string, any > {}

function updateMultisiteSchedule(
	multisiteSchedules: IStringIndex & MultisiteSchedulesUpdatesResponse,
	updatedSchedule?: ScheduleUpdates
): MultisiteSchedulesUpdatesResponse {
	if ( ! updatedSchedule ) {
		return multisiteSchedules;
	}

	for ( const key in multisiteSchedules ) {
		if ( typeof multisiteSchedules[ key ] === 'object' ) {
			if ( key === updatedSchedule.id ) {
				multisiteSchedules[ key ] = updatedSchedule;
			} else {
				updateMultisiteSchedule( multisiteSchedules[ key ], updatedSchedule );
			}
		}
	}
	return multisiteSchedules;
}

export function useScheduledUpdatesActivateMutation( queryOptions = {} ) {
	const queryClient = useQueryClient();

	const mutation = useMutation( {
		mutationFn: ( data: {
			siteSlug: SiteSlug;
			scheduleId: string;
			params: ActiveRequestParams;
		} ) => {
			const { siteSlug, scheduleId, params } = data;

			return wpcomRequest( {
				path: `/sites/${ siteSlug }/update-schedules/${ scheduleId }/active`,
				apiNamespace: 'wpcom/v2',
				method: 'POST',
				body: params,
			} );
		},
		onMutate: async ( data: {
			siteSlug: SiteSlug;
			scheduleId: string;
			params: ActiveRequestParams;
		} ) => {
			const { siteSlug, scheduleId, params } = data;
			// cancel in-flight queries because we don't want them to overwrite our optimistic update.
			await queryClient.cancelQueries( {
				queryKey: [ 'schedule-updates', siteSlug ],
			} );

			const prevSchedules: ScheduleUpdates[] =
				queryClient.getQueryData( [ 'schedule-updates', siteSlug ] ) || [];

			const prevMultisiteSchedules: MultisiteSchedulesUpdatesResponse | undefined =
				queryClient.getQueryData( [ 'multisite-schedules-update' ] );

			let newSchedule;
			const newSchedules = prevSchedules.map( ( x ) => {
				if ( x.id === scheduleId ) {
					newSchedule = { ...x, active: params.active };
					return newSchedule;
				}
				return x;
			} );

			const newMultisiteSchedules = updateMultisiteSchedule(
				JSON.parse( JSON.stringify( prevMultisiteSchedules ) ), // deep copy
				newSchedule
			);

			queryClient.setQueryData( [ 'schedule-updates', siteSlug ], newSchedules );
			queryClient.setQueryData( [ 'multisite-schedules-update' ], newMultisiteSchedules );

			return { prevSchedules, prevMultisiteSchedules };
		},
		onError: ( err, params, context ) => {
			const { siteSlug } = params;
			// Set previous value on error
			queryClient.setQueryData( [ 'schedule-updates', siteSlug ], context?.prevSchedules );
			queryClient.setQueryData( [ 'multisite-schedules-update' ], context?.prevMultisiteSchedules );
		},
		onSettled: ( data, error, variables ) => {
			const { siteSlug } = variables;

			// Re-fetch after error or success
			queryClient.invalidateQueries( { queryKey: [ 'schedule-updates', siteSlug ] } );
			queryClient.invalidateQueries( { queryKey: [ 'multisite-schedules-update', siteSlug ] } );
		},
		...queryOptions,
	} );

	const { mutate } = mutation;
	const activateSchedule = useCallback(
		( siteSlug: SiteSlug, scheduleId: string, params: ActiveRequestParams ) =>
			mutate( { siteSlug, scheduleId, params } ),
		[ mutate ]
	);

	return { activateSchedule, ...mutation };
}
