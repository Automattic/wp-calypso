/**
 * Internal dependencies
 */

import {
	MEMBERSHIPS_SETTINGS,
	MEMBERSHIPS_CONNECTED_ACCOUNTS_STRIPE_DISCONNECT_SUCCESS,
	NOTICE_CREATE,
} from 'state/action-types';

import 'state/data-layer/wpcom/sites/memberships';
import wpcom from 'lib/wp';

export const requestSettings = ( siteId ) => ( {
	siteId,
	type: MEMBERSHIPS_SETTINGS,
} );

export const requestDisconnectStripeAccount = (
	siteId,
	connectedAccountId,
	noticeTextOnProcessing,
	noticeTextOnSuccess
) => {
	return ( dispatch ) => {
		dispatch( {
			type: NOTICE_CREATE,
			notice: {
				duration: 10000,
				text: noticeTextOnProcessing,
				status: 'is-warning',
			},
		} );

		return wpcom.req
			.get( `/me/connected_account/stripe/${ connectedAccountId }/disconnect` )
			.then( () => {
				dispatch( {
					siteId,
					type: MEMBERSHIPS_CONNECTED_ACCOUNTS_STRIPE_DISCONNECT_SUCCESS,
				} );
				dispatch( {
					type: NOTICE_CREATE,
					notice: {
						duration: 5000,
						text: noticeTextOnSuccess,
						status: 'is-success',
					},
				} );
			} )
			.catch( ( error ) => {
				dispatch( {
					type: NOTICE_CREATE,
					notice: {
						duration: 10000,
						text: error.message,
						status: 'is-error',
					},
				} );
			} );
	};
};
