import apiFetch, { APIFetchOptions } from '@wordpress/api-fetch';
import { useQuery } from 'react-query';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import type { SupportSession } from './types';

interface Response {
	data: SupportSession[];
}

const ACTIVE_STATUSES = [ 'New', 'Open', 'Hold' ];

export function useHasActiveSupport( type: 'CHAT' | 'TICKET', show = true ) {
	return useQuery< Response | SupportSession | boolean >(
		`help-support-history-${ type }-${ show ? 'open' : 'closed' }`,
		async () =>
			canAccessWpcomApis()
				? await wpcomRequest( {
						path: `support-history/${ type }`,
						apiNamespace: 'wpcom/v2/',
						apiVersion: '2',
				  } )
				: ( ( await apiFetch( {
						path: `help-center/support-history/${ type }`,
						global: true,
				  } as APIFetchOptions ) ) as Response ),
		{
			refetchOnWindowFocus: false,
			keepPreviousData: false,
			refetchOnMount: true,
			enabled: show,
			select: ( response ) => {
				const recentSession = ( response as Response ).data[ 0 ];
				return ACTIVE_STATUSES.includes( recentSession.status ) ? recentSession : false;
			},
		}
	);
}
