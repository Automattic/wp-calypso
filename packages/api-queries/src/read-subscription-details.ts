import { fetchSubscriptionDetails } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

interface SubscriptionDetailsArgs {
	blogId?: string;
	subscriptionId?: string;
}

export const subscriptionDetailsQuery = ( { blogId, subscriptionId }: SubscriptionDetailsArgs ) =>
	queryOptions( {
		queryKey: [ 'read', 'subscription-details', { blogId, subscriptionId } ],
		queryFn: () => fetchSubscriptionDetails( { blogId, subscriptionId } ),
		enabled: Boolean( blogId || subscriptionId ),
		staleTime: 60 * 1000,
		refetchOnWindowFocus: false,
	} );
