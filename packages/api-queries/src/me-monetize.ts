import { fetchMonetizeSubscriptions } from '@automattic/api-core';
import { queryOptions, useQuery } from '@tanstack/react-query';

export const monetizeSubscriptionsQuery = () =>
	queryOptions( {
		queryKey: [ 'me', 'monetize', 'subscriptions' ],
		queryFn: () => fetchMonetizeSubscriptions(),
	} );

export const monetizeSubscriptionQuery = ( subscriptionId: string ) =>
	queryOptions( {
		...monetizeSubscriptionsQuery(),
		enabled: !! subscriptionId,
		select: ( data ) => {
			const subscription = data?.find( ( sub ) => sub.ID === subscriptionId );
			if ( ! subscription ) {
				throw new Error( `Subscription with ID ${ subscriptionId } not found` );
			}
			return subscription;
		},
	} );

