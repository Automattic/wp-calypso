import { useQuery } from 'react-query';
import wpcom from 'calypso/lib/wp';

const ACTIVE_STATUSES = [ 'New', 'Open', 'Hold' ];

export const useActiveSupportTicketsQuery = ( email, queryOptions = {} ) =>
	useQuery(
		[ 'activeSupportTickets', email ],
		() => wpcom.req.get( '/support-history', { email, apiNamespace: 'wpcom/v2' } ),
		{
			enabled: !! email,
			select: ( { data } ) =>
				data.filter(
					( item ) => item.type === 'Zendesk_History' && ACTIVE_STATUSES.includes( item.status )
				),
			meta: {
				persist: false,
			},
			...queryOptions,
		}
	);
