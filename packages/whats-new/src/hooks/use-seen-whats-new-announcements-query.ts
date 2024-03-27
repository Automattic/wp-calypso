/* eslint-disable no-restricted-imports */
import { useQuery } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';

interface APIFetchOptions {
	global: boolean;
	path: string;
}
interface SeenAnnouncementIDsResponse {
	seen_announcement_ids: string[];
}

export const SEEN_WHATS_NEW_ANNOUCNEMENT_IDS = 'SEEN_WHATS_NEW_ANNOUCNEMENT_IDS';

/**
 * Get a list of the "Whats New" announcements that the user has seen
 * @returns Returns the result of querying the "whats-new/seen-announcement-ids" endpoint
 */
export const useSeenWhatsNewAnnouncementsQuery = () => {
	return useQuery< SeenAnnouncementIDsResponse, Error, string[] >( {
		queryKey: [ SEEN_WHATS_NEW_ANNOUCNEMENT_IDS ],
		queryFn: async () =>
			canAccessWpcomApis()
				? await wpcomRequest( {
						path: `/whats-new/seen-announcement-ids`,
						apiNamespace: 'wpcom/v2',
				  } )
				: await apiFetch( {
						global: true,
						path: `/wpcom/v2/whats-new/seen-announcement-ids`,
				  } as APIFetchOptions ),
		refetchOnWindowFocus: false,
		select: ( data ) => data.seen_announcement_ids,
	} );
};
