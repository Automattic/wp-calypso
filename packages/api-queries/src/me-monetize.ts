import {
	fetchMonetizeSubscriptions,
	MonetizeSubscriptionAutoRenewResponse,
	MonetizeSubscriptionStopResponse,
	requestAutoRenewDisable,
	requestAutoRenewResume,
	requestSubscriptionStop,
} from '@automattic/api-core';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';

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

const updateSubscriptionCache =
	( subscriptionId: string ) => ( data: MonetizeSubscriptionAutoRenewResponse ) => {
		queryClient.invalidateQueries( {
			queryKey: [ monetizeSubscriptionQuery( subscriptionId ).queryKey ],
		} );

		queryClient.setQueryData(
			monetizeSubscriptionsQuery().queryKey,
			( oldList ) =>
				oldList?.map( ( s ) =>
					s.ID === subscriptionId ? { ...s, renew_interval: data.subscription.renew_interval } : s
				) ?? []
		);
	};

export const monetizeSubscriptionDisableAutoRenew = ( subscriptionId: string ) =>
	mutationOptions( {
		mutationFn: () => requestAutoRenewDisable( subscriptionId ),
		onSuccess: updateSubscriptionCache( subscriptionId ),
	} );
export const monetizeSubscriptionResumeAutoRenew = ( subscriptionId: string ) =>
	mutationOptions( {
		mutationFn: () => requestAutoRenewResume( subscriptionId ),
		onSuccess: updateSubscriptionCache( subscriptionId ),
	} );

export const monetizeSubscriptionStop = ( subscriptionId: string ) => {
	return mutationOptions( {
		mutationFn: () => requestSubscriptionStop( subscriptionId ),
		onSuccess: ( response: MonetizeSubscriptionStopResponse ) => {
			queryClient.invalidateQueries( {
				queryKey: [ monetizeSubscriptionsQuery().queryKey ],
			} );

			/**
			 * After the cancellation succeeds, we might need to send the user to the
			 * Jetpack site which had the subscription so that the user can receive a
			 * new token (contained in the redirect url) which represents the updated
			 * subscription status. The Jetpack site will then redirect the user back
			 * to Calypso with the query string parameter `removed=true` which can be
			 * used to display the notification labeled "This item has been removed".
			 */
			if ( response.redirect ) {
				window.location.assign( response.redirect );
			}
		},
	} );
};
