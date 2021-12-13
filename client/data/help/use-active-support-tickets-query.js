import { useQuery } from 'react-query';
import wpcom from 'calypso/lib/wp';

const ACTIVE_STATUSES = [ 'New', 'Open', 'Hold' ];

// Support History data needs to be disabled temporarily to avoid rate-limiting with our Zendesk API.
// It is only used for non-essential read-only operations right now.
const ENABLE_SUPPORT_HISTORY = false;

export const useActiveSupportTicketsQuery = ( email, queryOptions = {} ) =>
	useQuery(
		[ 'activeSupportTickets', email ],
		() => wpcom.req.get( '/support-history', { email, apiNamespace: 'wpcom/v2' } ),
		{
			enabled: !! email && ENABLE_SUPPORT_HISTORY,
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
