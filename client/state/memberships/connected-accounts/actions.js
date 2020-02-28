/**
 * Internal dependencies
 */

import wpcom from 'lib/wp';
import requestExternalAccess from 'lib/sharing';
import { listMembershipsConnectedAccounts } from '../actions';
import {
	MEMBERSHIPS_CONNECTED_ACCOUNTS_STRIPE_AUTHORIZE_REQUEST,
	MEMBERSHIPS_CONNECTED_ACCOUNTS_STRIPE_DISCONNECT,
	NOTICE_CREATE,
} from 'state/action-types';
import { change } from 'redux-form';

export function authorizeStripeAccount() {
	return dispatch => {
		dispatch( { type: MEMBERSHIPS_CONNECTED_ACCOUNTS_STRIPE_AUTHORIZE_REQUEST } );

		return wpcom.req.post( '/me/stripe_connect/oauth/url' ).then( url =>
			requestExternalAccess( url.url, () =>
				dispatch( listMembershipsConnectedAccounts() )
					// After we refresh list of accounts, we have to select it in the form.
					.then( accounts =>
						dispatch(
							change(
								'simplePaymentsForm',
								'stripe_account',
								Math.max( ...Object.keys( accounts ) ),
								false,
								false
							)
						)
					)
			)
		);
	};
}

export const requestDisconnectStripeAccount = ( connectedAccountId, noticeText ) => {
	return dispatch => {
		dispatch( {
			type: MEMBERSHIPS_CONNECTED_ACCOUNTS_STRIPE_DISCONNECT,
			connectedAccountId,
		} );

		dispatch( {
			type: NOTICE_CREATE,
			notice: {
				duration: 5000,
				text: noticeText,
				status: 'is-success',
			},
		} );

		return {};

		// return wpcom.req
		// 	.post( {
		// 		method: 'POST',
		// 		path: `/me/connected_account/stripe/${connectedAccountId}/disconnect`,
		// 	} )
		// 	.then( () => {
		// 		dispatch( {
		// 			type: NOTICE_CREATE,
		// 			notice: {
		// 				duration: 5000,
		// 				text: noticeText,
		// 				status: 'is-success',
		// 			},
		// 		} );
		// 		return connectedAccountId;
		// 	} )
		// 	.catch( error => {
		// 		dispatch( {
		// 			type: MEMBERSHIPS_CONNECTED_ACCOUNTS_STRIPE_DISCONNECT_FAILURE,
		// 			connectedAccountId,
		// 			error,
		// 		} );
		// 		dispatch( {
		// 			type: NOTICE_CREATE,
		// 			notice: {
		// 				duration: 10000,
		// 				text: error.message,
		// 				status: 'is-error',
		// 			},
		// 		} );
		// 	} );
	};
};
