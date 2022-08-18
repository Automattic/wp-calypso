import { useQuery } from 'react-query';
import wpcomRequest from 'wpcom-proxy-request';
import { SupportTicket } from './types';

const ACTIVE_STATUSES = [ 'New', 'Open', 'Hold' ];

export const useActiveSupportTicketsQuery = ( email: string, queryOptions = {} ) => {
	return useQuery< SupportTicket[] >(
		[ 'activeSupportTickets', email ],
		async (): Promise< SupportTicket[] > => {
			const { data = [] }: { data: SupportTicket[] } = await wpcomRequest( {
				path: '/support-history',
				query: `email=${ encodeURIComponent( email ) }`,
				apiNamespace: 'wpcom/v2',
			} );
			return data;
		},
		{
			enabled: !! email,
			select: ( data: SupportTicket[] ): SupportTicket[] =>
				data.filter(
					( item ) => item.type === 'Zendesk_History' && ACTIVE_STATUSES.includes( item.status )
				),
			meta: {
				persist: false,
			},
			refetchOnWindowFocus: false,
			keepPreviousData: true,
			...queryOptions,
		}
	);
};
