import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import wpcomRequest from 'wpcom-proxy-request';
import type { ScheduleUpdates } from 'calypso/data/plugins/use-update-schedules-query';
import type { SiteSlug } from 'calypso/types';

export type ActiveRequestParams = {
	active: boolean;
};

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

			const newSchedules = prevSchedules.map( ( x ) => {
				if ( x.id === scheduleId ) {
					return { ...x, active: params.active };
				}
				return x;
			} );

			queryClient.setQueryData( [ 'schedule-updates', siteSlug ], newSchedules );

			return { prevSchedules };
		},
		onError: ( err, params, context ) => {
			const { siteSlug } = params;
			// Set previous value on error
			queryClient.setQueryData( [ 'schedule-updates', siteSlug ], context?.prevSchedules );
		},
		onSettled: ( data, error, variables ) => {
			const { siteSlug } = variables;

			// Re-fetch after error or success
			queryClient.invalidateQueries( { queryKey: [ 'schedule-updates', siteSlug ] } );
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
