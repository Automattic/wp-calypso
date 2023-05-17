import { useQuery } from '@tanstack/react-query';
import apiFetch, { APIFetchOptions } from '@wordpress/api-fetch';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import type { SupportSession } from './types';

interface Response {
	data: SupportSession[];
}

const ACTIVE_STATUSES = [ 'New', 'Open', 'Hold' ];

/**
 * Checks if the user has an active support session or a recent ticket.
 *
 * NOTE: Chat mode isn't functional at the moment.
 */
export function useSupportHistory( type: 'chat' | 'ticket', email: string, show = true ) {
	return useQuery(
		[ 'help-support-history', type, email ],
		() =>
			canAccessWpcomApis()
				? wpcomRequest< Response >( {
						path: `support-history/${ encodeURIComponent( type ) }`,
						apiNamespace: 'wpcom/v2/',
						apiVersion: '2',
						query: email ? `email=${ encodeURIComponent( email ) }` : '',
				  } )
				: apiFetch< Response >( {
						path:
							`help-center/support-history/${ encodeURIComponent( type ) }/` +
							( email ? `?email=${ encodeURIComponent( email ) }` : '' ),
						global: true,
				  } as APIFetchOptions ),
		{
			refetchOnWindowFocus: false,
			keepPreviousData: false,
			refetchOnMount: true,
			enabled: show,
			select: ( response ) => {
				return response.data.filter( ( session ) => ACTIVE_STATUSES.includes( session.status ) );
			},
			staleTime: 30 * 60 * 1000,
			meta: {
				persist: false,
			},
		}
	);
}
