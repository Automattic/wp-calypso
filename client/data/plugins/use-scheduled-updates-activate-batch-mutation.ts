import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import wpcomRequest from 'wpcom-proxy-request';
import { ActiveRequestParams } from './use-scheduled-updates-activate-mutation';
import type { SiteId, SiteSlug } from 'calypso/types';

export function useScheduledUpdatesActivateBatchMutation( mutationOptions = {} ) {
	const queryClient = useQueryClient();

	const mutation = useMutation( {
		mutationFn: ( data: {
			sites: { id: SiteId; slug: SiteSlug }[];
			scheduleId: string;
			params: ActiveRequestParams;
		} ) => {
			const { sites, scheduleId, params } = data;
			return Promise.all(
				sites.map( async ( site ) => {
					try {
						const response = await wpcomRequest( {
							path: `/sites/${ site.slug }/update-schedules/${ scheduleId }/active`,
							apiNamespace: 'wpcom/v2',
							method: 'POST',
							body: params,
						} );
						return { site, response };
					} catch ( error ) {
						return { site, error };
					}
				} )
			);
		},
		onMutate: ( data: {
			sites: { id: SiteId; slug: SiteSlug }[];
			scheduleId: string;
			params: ActiveRequestParams;
		} ) => {
			const { sites, scheduleId, params } = data;
			// cancel in-flight queries because we don't want them to overwrite our optimistic update.
			queryClient.cancelQueries( { queryKey: [ 'multisite-schedules-update' ] } );

			const prevResult = queryClient.getQueryData( [ 'multisite-schedules-update' ] ) || {};
			const updatedResult = JSON.parse( JSON.stringify( prevResult ) ); // deep copy

			sites.forEach( ( site: { id: SiteId; slug: SiteSlug } ) => {
				if ( updatedResult?.sites?.[ site.id ]?.[ scheduleId ] ) {
					updatedResult.sites[ site.id ][ scheduleId ].active = params.active;
				}
			} );

			queryClient.setQueryData( [ 'multisite-schedules-update' ], updatedResult );
			return { prevResult };
		},
		onError: ( err, params, context ) => {
			// Set previous value on error
			queryClient.setQueryData( [ 'multisite-schedules-update' ], context?.prevResult );
		},
		...mutationOptions,
	} );

	const { mutate } = mutation;
	const activateSchedule = useCallback(
		( sites: { id: SiteId; slug: SiteSlug }[], scheduleId: string, params: ActiveRequestParams ) =>
			mutate( { sites, scheduleId, params } ),
		[ mutate ]
	);

	return { activateSchedule, ...mutation };
}
