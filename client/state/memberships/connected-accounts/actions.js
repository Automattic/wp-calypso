/**
 * Internal dependencies
 */

import wpcom from 'lib/wp';
import requestExternalAccess from 'lib/sharing';
import { listMembershipsConnectedAccounts } from '../actions';
import { MEMBERSHIPS_CONNECTED_ACCOUNTS_STRIPE_AUTHORIZE_REQUEST } from 'state/action-types';
import { change } from 'redux-form';

export function authorizeStripeAccount() {
	return ( dispatch ) => {
		dispatch( { type: MEMBERSHIPS_CONNECTED_ACCOUNTS_STRIPE_AUTHORIZE_REQUEST } );

		return wpcom.req.post( '/me/stripe_connect/oauth/url' ).then( ( url ) =>
			requestExternalAccess( url.url, () =>
				dispatch( listMembershipsConnectedAccounts() )
					// After we refresh list of accounts, we have to select it in the form.
					.then( ( accounts ) =>
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
