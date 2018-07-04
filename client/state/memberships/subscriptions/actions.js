/** @format */

/**
 * Internal dependencies
 */

import {
	MEMBERSHIPS_SUBSCRIPTIONS_LIST,
	MEMBERSHIPS_SUBSCRIPTIONS_RECEIVE,
	MEMBERSHIPS_SUBSCRIPTIONS_LIST_SUCCESS,
	MEMBERSHIPS_SUBSCRIPTIONS_LIST_FAILURE,
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
