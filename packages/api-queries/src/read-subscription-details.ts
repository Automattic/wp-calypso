import { fetchReadSubscriptionDetails } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

interface ReadSubscriptionDetailsArgs {
	blogId?: string;
	subscriptionId?: string;
}

export const readSubscriptionDetailsQuery = ( {
	blogId,
	subscriptionId,
}: ReadSubscriptionDetailsArgs ) =>
	queryOptions( {
		queryKey: [ 'read', 'subscription-details', { blogId, subscriptionId } ],
		queryFn: () => fetchReadSubscriptionDetails( { blogId, subscriptionId } ),
		enabled: Boolean( blogId || subscriptionId ),
		staleTime: 60 * 1000,
		refetchOnWindowFocus: false,
	} );
