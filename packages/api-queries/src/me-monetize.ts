import {
	fetchMonetizeSubscriptions,
	MonetizeSubscription,
	MonetizeSubscriptionAutoRenewResponse,
	MonetizeSubscriptionStopResponse,
	requestAutoRenewDisable,
	requestAutoRenewResume,
	requestSubscriptionStop,
} from '@automattic/api-core';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';

const MonetizeQueryKeys = [ 'me', 'monetize', 'subscriptions' ];

export const monetizeSubscriptionsQuery = () =>
	queryOptions( {
		queryKey: MonetizeQueryKeys,
		queryFn: () => fetchMonetizeSubscriptions(),
	} );

export const monetizeSubscriptionQuery = ( subscriptionId: string ) =>
	queryOptions( {
		queryKey: [ ...MonetizeQueryKeys, subscriptionId ],
		queryFn: async () => {
			const subscriptions: MonetizeSubscription[] = await queryClient.ensureQueryData( {
				queryKey: monetizeSubscriptionsQuery().queryKey,
			} );
			const subscription = ( subscriptions ?? [] ).find( ( sub ) => sub.ID === subscriptionId );
			if ( ! subscription ) {
				throw new Error( `Subscription with ID ${ subscriptionId } not found` );
			}
			return subscription;
		},
	} );

const updateSubscriptionCache =
	( subscriptionId: string ) => ( data: MonetizeSubscriptionAutoRenewResponse ) => {
		// We first update the list of subscriptions
		queryClient.setQueryData(
			monetizeSubscriptionsQuery().queryKey,
			( oldList ) =>
				oldList?.map( ( s ) =>
					s.ID === subscriptionId ? { ...s, renew_interval: data.subscription.renew_interval } : s
				) ?? []
		);
		// Then we invalidate the cache of the specific subscription to ensure all data is fresh
		queryClient.invalidateQueries( {
			queryKey: monetizeSubscriptionQuery( subscriptionId ).queryKey,
		} );
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
			// We can remove the subscription from the list of subscriptions
			queryClient.setQueryData(
				monetizeSubscriptionsQuery().queryKey,
				( oldList ) => oldList?.filter( ( s ) => s.ID !== subscriptionId )
			);

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
			if ( response && response.redirect ) {
				window.location.assign( response.redirect );
			}
		},
	} );
};
