/* eslint-disable no-restricted-imports */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import { SEEN_WHATS_NEW_ANNOUCNEMENT_IDS } from './use-seen-whats-new-announcements-query';

interface APIFetchOptions {
	global: boolean;
	path: string;
}

/**
 * Saves the list of "Whats New" announcements that the user has seen
 * @returns A react-query mutation to save to the "whats-new/seen-announcement-ids" endpoint
 */
export const useSeenWhatsNewAnnouncementsMutation = () => {
	const queryClient = useQueryClient();

	return useMutation( {
		mutationFn: async ( seenAnnouncenmentIds: string[] ) => {
			return canAccessWpcomApis()
				? await wpcomRequest( {
						path: `/whats-new/seen-announcement-ids`,
						apiNamespace: 'wpcom/v2',
						method: 'POST',
						body: {
							seen_announcement_ids: seenAnnouncenmentIds,
						},
				  } )
				: await apiFetch( {
						global: true,
						path: `/wpcom/v2/whats-new/seen-announcement-ids`,
						method: 'POST',
						data: { seen_announcement_ids: seenAnnouncenmentIds },
				  } as APIFetchOptions );
		},
		onMutate: async ( seenAnnouncenmentIds: string[] ) => {
			await queryClient.cancelQueries( { queryKey: [ SEEN_WHATS_NEW_ANNOUCNEMENT_IDS ] } );

			queryClient.setQueryData( [ SEEN_WHATS_NEW_ANNOUCNEMENT_IDS ], seenAnnouncenmentIds );

			const previousData = queryClient.getQueryData< string[] >( [
				SEEN_WHATS_NEW_ANNOUCNEMENT_IDS,
			] );

			return { previousData };
		},
		onError: ( error, variables, context ) => {
			queryClient.setQueryData( [ SEEN_WHATS_NEW_ANNOUCNEMENT_IDS ], context?.previousData );
		},
		onSettled: async () => {
			await queryClient.invalidateQueries( { queryKey: [ SEEN_WHATS_NEW_ANNOUCNEMENT_IDS ] } );
		},
	} );
};
