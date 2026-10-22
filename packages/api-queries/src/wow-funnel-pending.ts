import { fetchWowFunnelPending } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const wowFunnelPendingQuery = () =>
	queryOptions( {
		queryKey: [ 'wow-funnel', 'pending' ],
		queryFn: fetchWowFunnelPending,
		// A held site changes state when its owner pays or its hold lapses, neither of which
		// happens while they sit on a page that only wants to point them at checkout.
		staleTime: 5 * 60 * 1000,
	} );
