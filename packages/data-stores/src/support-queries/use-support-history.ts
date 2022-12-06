import apiFetch, { APIFetchOptions } from '@wordpress/api-fetch';
import { useQuery } from 'react-query';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import type { SupportTicket } from '@automattic/help-center';

type SupportTicketResponse = {
	data: SupportTicket[];
};

// export type Ticket = {
// 	this_is_nice: string;
// 	this_is_nice_too?: boolean;
// };
const ACTIVE_STATUSES = [ 'New', 'Open', 'Hold' ];

export function useHasActiveSupport( type: 'CHAT' | 'OTHER' ) {
	const { data: tickets, isLoading } = useActiveSupportHistory( type );

	if ( isLoading || ! tickets ) {
		return false;
	}

	return tickets.length > 0;
}

export function useActiveSupportHistory( type: 'CHAT' | 'OTHER' ) {
	return useQuery< SupportTicket >(
		'help-support-history',
		async () =>
			canAccessWpcomApis()
				? await wpcomRequest( {
						path: 'support-history/chat',
						apiNamespace: 'wpcom/v2/',
						apiVersion: '2',
				  } )
				: ( ( await apiFetch( {
						path: `help-center/support-history/chat`,
						global: true,
				  } as APIFetchOptions ) ) as SupportTicketResponse ),
		{
			refetchOnMount: false,
			refetchOnWindowFocus: false,
			refetchOnReconnect: false,
			select: ( response: SupportTicketResponse ) => {
				return response.data.filter( ( item ) => ACTIVE_STATUSES.includes( item.status ) );
			},
			meta: {
				persist: false,
			},
		}
	);
}
