import wpcom from 'calypso/lib/wp';
import {
	MEMBERSHIPS_SUBSCRIPTIONS_LIST_REQUEST,
	MEMBERSHIPS_SUBSCRIPTION_STOP,
	MEMBERSHIPS_SUBSCRIPTION_STOP_SUCCESS,
	MEMBERSHIPS_SUBSCRIPTION_STOP_FAILURE,
} from 'calypso/state/action-types';

import 'calypso/state/data-layer/wpcom/sites/memberships/subscriptions';
import 'calypso/state/memberships/init';

export const requestSubscriptionsList = () => ( {
	type: MEMBERSHIPS_SUBSCRIPTIONS_LIST_REQUEST,
} );

export const requestSubscriptionStop = ( subscriptionId ) => {
	return ( dispatch ) => {
		dispatch( {
			type: MEMBERSHIPS_SUBSCRIPTION_STOP,
			subscriptionId,
		} );
		return wpcom.req
			.post( `/me/memberships/subscriptions/${ subscriptionId }/cancel` )
			.then( ( response ) => {
				/**
				 * After the cancellation succeeds, we might need to send the user to the
				 * Jetpack site which had the subscription so that the user can receive a
				 * new token (contained in the redirect url) which represents the updated
				 * subscription status. The Jetpack site will then redirect the user back
				 * to Calypso with the query string parameter `removed=true` which can be
				 * used to display the notification labeled "This item has been removed".
				 */
				if ( response.redirect ) {
					window.location = response.redirect;
				} else {
					dispatch( {
						type: MEMBERSHIPS_SUBSCRIPTION_STOP_SUCCESS,
						subscriptionId,
					} );
				}
			} )
			.catch( ( error ) => {
				dispatch( {
					type: MEMBERSHIPS_SUBSCRIPTION_STOP_FAILURE,
					subscriptionId,
					error,
				} );
			} );
	};
};
