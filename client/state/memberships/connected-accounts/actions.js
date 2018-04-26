/** @format */

/**
 * Internal dependencies
 */

import wpcom from 'lib/wp';
import requestExternalAccess from 'lib/sharing';
import { listMembershipsConnectedAccounts } from '../actions';

export function authorizeStripeAccount() {
	return dispatch => {
		dispatch( {
			type: 'MEMBERSHIPS_CONNECTED_ACCOUNTS_STRIPE_AUTHORIZE_REQUEST',
		} );

		return wpcom.req.post( '/me/stripe_connect/oauth/url' ).then( url =>
			requestExternalAccess( url.url, () => {
				dispatch( listMembershipsConnectedAccounts() );
				// Somehow set form to the new account.
			} )
		);
		// .catch( error => {
		// 	console.
		// } );
	};
}
