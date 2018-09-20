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
	TWO_FACTOR_AUTHENTICATION_PUSH_POLL_START,
	TWO_FACTOR_AUTHENTICATION_PUSH_POLL_STOP,
} from 'state/action-types';
import {
	getTwoFactorAuthNonce,
	getTwoFactorPushPollInProgress,
	getTwoFactorPushToken,
	getTwoFactorUserId,
} from 'state/login/selectors';
import { http } from 'state/http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { bypassDataLayer } from 'state/data-layer/utils';
import { addLocaleToWpcomUrl, getLocaleSlug } from 'lib/i18n-utils';
import { receivedTwoFactorPushNotificationApproved } from 'state/login/actions.js';

import { registerHandlers } from 'state/data-layer/handler-registry';

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

const receivedTwoFactorPushNotificationApprovedResponse = ( { dispatch }, _, response ) =>
	dispatch( receivedTwoFactorPushNotificationApproved( get( response, 'body.data.token_links' ) ) );

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
	receivedTwoFactorPushNotificationApprovedResponse,
	receivedTwoFactorPushNotificationError
);

registerHandlers( 'state/data-layer/wpcom/login-2fa/index.js', {
	[ TWO_FACTOR_AUTHENTICATION_PUSH_POLL_START ]: [
		( store, action ) => {
			// We need to store to update for `getTwoFactorPushPollInProgress` selector
			store.dispatch( bypassDataLayer( action ) );
			return makePushNotificationRequest( store, action );
		},
	],
} );

export default {};
