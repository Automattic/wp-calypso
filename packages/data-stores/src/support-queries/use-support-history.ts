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
export function useHasActiveSupport( type: 'chat' | 'ticket', email: string, show = true ) {
	return useQuery< Response | SupportSession | boolean >(
		[ 'help-support-history', type, show, email ],
		() =>
			canAccessWpcomApis()
				? wpcomRequest( {
						path: `support-history/${ encodeURIComponent( type ) }/?email=${ encodeURIComponent(
							email
						) }`,
						apiNamespace: 'wpcom/v2/',
						apiVersion: '2',
				  } )
				: apiFetch< Response >( {
						path: `help-center/support-history/${ encodeURIComponent(
							type
						) }/?email=${ encodeURIComponent( email ) }`,
						global: true,
				  } as APIFetchOptions ),
		{
			refetchOnWindowFocus: false,
			keepPreviousData: false,
			refetchOnMount: true,
			enabled: show,
			select: ( response ) => {
				const recentSession = ( response as Response ).data[ 0 ];
				return ACTIVE_STATUSES.includes( recentSession.status ) ? recentSession : false;
			},
			staleTime: 30 * 60 * 1000,
		}
	);
}
