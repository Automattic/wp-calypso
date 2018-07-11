/** @format */

/**
 * Internal dependencies
 */

import {
	MEMBERSHIPS_SUBSCRIPTIONS_LIST,
	MEMBERSHIPS_SUBSCRIPTIONS_RECEIVE,
	MEMBERSHIPS_SUBSCRIPTIONS_LIST_SUCCESS,
	MEMBERSHIPS_SUBSCRIPTIONS_LIST_FAILURE,
	MEMBERSHIPS_SUBSCRIPTION_STOP,
	MEMBERSHIPS_SUBSCRIPTION_STOP_SUCCESS,
	MEMBERSHIPS_SUBSCRIPTION_STOP_FAILURE,
} from 'state/action-types';
import wpcom from 'lib/wp';

export const requestSubscriptionsList = () => {
	return dispatch => {
		dispatch( {
			type: MEMBERSHIPS_SUBSCRIPTIONS_LIST,
		} );

		return wpcom.req
			.get( '/me/memberships/subscriptions' )
			.then( ( { subscriptions, total } ) => {
				dispatch( {
					type: MEMBERSHIPS_SUBSCRIPTIONS_RECEIVE,
					subscriptions,
					total,
				} );
				dispatch( {
					type: MEMBERSHIPS_SUBSCRIPTIONS_LIST_SUCCESS,
				} );
			} )
			.catch( error => {
				dispatch( {
					type: MEMBERSHIPS_SUBSCRIPTIONS_LIST_FAILURE,
					error,
				} );
			} );
	};
};

export const requestSubscriptionStop = subscriptionId => {
	return dispatch => {
		dispatch( {
			type: MEMBERSHIPS_SUBSCRIPTION_STOP,
			subscriptionId,
		} );

		return wpcom.req
			.post( `/me/memberships/subscriptions/${ subscriptionId }/cancel` )
			.then( () => {
				dispatch( {
					type: MEMBERSHIPS_SUBSCRIPTION_STOP_SUCCESS,
					subscriptionId,
				} );
			} )
			.catch( error => {
				dispatch( {
					type: MEMBERSHIPS_SUBSCRIPTION_STOP_FAILURE,
					subscriptionId,
					error,
				} );
			} );
	};
};
