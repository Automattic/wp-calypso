import { useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';
import wpcomRequest from 'wpcom-proxy-request';
import type { SiteSlug } from 'calypso/types';

export function useCreateScheduleUpdatesMutation( siteSlug: SiteSlug, queryOptions = {} ) {
	const mutation = useMutation( {
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
	const createScheduleUpdates = useCallback( ( params: object ) => mutate( params ), [ mutate ] );

	return { createScheduleUpdates, ...mutation };
}

export function useDeleteScheduleUpdatesMutation( siteSlug: SiteSlug, queryOptions = {} ) {
	const mutation = useMutation( {
		mutationFn: ( id: string ) =>
			wpcomRequest( {
				path: `/sites/${ siteSlug }/update-schedules/${ id }`,
				apiNamespace: 'wpcom/v2',
				method: 'DELETE',
			} ),
		...queryOptions,
	} );

	const { mutate } = mutation;
	const deleteScheduleUpdates = useCallback( ( id: string ) => mutate( id ), [ mutate ] );

	return { deleteScheduleUpdates, ...mutation };
}
