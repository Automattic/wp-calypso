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
			requestExternalAccess( url.url, () =>
				dispatch( listMembershipsConnectedAccounts() )
					// After we refresh list of accounts, we have to select it in the form.
					.then( accounts =>
						dispatch( {
							type: '@@redux-form/CHANGE',
							meta: {
								form: 'simplePaymentsForm',
								field: 'stripe_account',
								touch: false,
								persistentSubmitErrors: false,
							},
							payload: Math.max( ...Object.keys( accounts ) ), // Last account is the one with biggest ID.
						} )
					)
			)
		);
	};
}
