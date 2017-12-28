/** @format */

/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Internal dependencies
 */
import config from 'config';
import {
	TWO_FACTOR_AUTHENTICATION_UPDATE_NONCE,
	TWO_FACTOR_AUTHENTICATION_PUSH_POLL_COMPLETED,
	TWO_FACTOR_AUTHENTICATION_PUSH_POLL_START,
	TWO_FACTOR_AUTHENTICATION_PUSH_POLL_STOP,
} from 'client/state/action-types';
import {
	getTwoFactorAuthNonce,
	getTwoFactorPushPollInProgress,
	getTwoFactorPushToken,
	getTwoFactorUserId,
} from 'client/state/login/selectors';
import { http } from 'client/state/http/actions';
import { dispatchRequest } from 'client/state/data-layer/wpcom-http/utils';
import { bypassDataLayer } from 'client/state/data-layer/utils';
import { addLocaleToWpcomUrl, getLocaleSlug } from 'client/lib/i18n-utils';

/**
 * Module constants
 */
const POLL_APP_PUSH_INTERVAL_SECONDS = 5;

const requestTwoFactorPushNotificationStatus = ( store, action ) => {
	const authType = 'push';

	store.dispatch(
		http(
			{
				url: addLocaleToWpcomUrl(
					'https://wordpress.com/wp-login.php?action=two-step-authentication-endpoint',
					getLocaleSlug()
				),
				method: 'POST',
				headers: [ [ 'Content-Type', 'application/x-www-form-urlencoded' ] ],
				withCredentials: true,
				body: {
					user_id: getTwoFactorUserId( store.getState() ),
					auth_type: authType,
					remember_me: true,
					two_step_nonce: getTwoFactorAuthNonce( store.getState(), authType ),
					two_step_push_token: getTwoFactorPushToken( store.getState() ),
					client_id: config( 'wpcom_signup_id' ),
					client_secret: config( 'wpcom_signup_key' ),
				},
			},
			action
		)
	);
};

const receivedTwoFactorPushNotificationApproved = ( { dispatch } ) =>
	dispatch( { type: TWO_FACTOR_AUTHENTICATION_PUSH_POLL_COMPLETED } );

/**
 * Receive error from the two factor push notification status http request
 *
 * @param {Object}	 store  Global redux store
 * @param {Object}	 action dispatched action
 * @param {Object}	 error  the error object
 */
const receivedTwoFactorPushNotificationError = ( store, action, error ) => {
	const isNetworkFailure = ! error.status;
	const twoStepNonce = get( error, 'response.body.data.two_step_nonce' );

	if ( twoStepNonce ) {
		store.dispatch( {
			type: TWO_FACTOR_AUTHENTICATION_UPDATE_NONCE,
			nonceType: 'push',
			twoStepNonce,
		} );
	} else if ( ! isNetworkFailure ) {
		store.dispatch( { type: TWO_FACTOR_AUTHENTICATION_PUSH_POLL_STOP } );

		throw new Error( 'Unable to continue polling because of error' );
	}

	if ( getTwoFactorPushPollInProgress( store.getState() ) ) {
		setTimeout(
			// eslint-disable-next-line no-use-before-define
			() => makePushNotificationRequest( store, { type: action.type } ),
			POLL_APP_PUSH_INTERVAL_SECONDS * 1000
		);
	}
};

const makePushNotificationRequest = dispatchRequest(
	requestTwoFactorPushNotificationStatus,
	receivedTwoFactorPushNotificationApproved,
	receivedTwoFactorPushNotificationError
);

export default {
	[ TWO_FACTOR_AUTHENTICATION_PUSH_POLL_START ]: [
		( store, action ) => {
			// We need to store to update for `getTwoFactorPushPollInProgress` selector
			store.dispatch( bypassDataLayer( action ) );
			return makePushNotificationRequest( store, action );
		},
	],
};
