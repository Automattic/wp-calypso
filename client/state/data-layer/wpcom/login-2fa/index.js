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
} from 'state/action-types';
import {
	getRememberMe,
	getTwoFactorAuthNonce,
	getTwoFactorPushPollInProgress,
	getTwoFactorPushToken,
	getTwoFactorUserId,
} from 'state/login/selectors';
import { http } from 'state/http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { local } from 'state/data-layer/utils';

/***
 * Module constants
 */
const POLL_APP_PUSH_INTERVAL_SECONDS = 5;

const requestTwoFactorPushNotificationStatus = ( store, action ) => {
	const authType = 'push';

	store.dispatch(
		http( {
			url: 'https://wordpress.com/wp-login.php?action=two-step-authentication-endpoint',
			method: 'POST',
			headers: [
				[ 'Content-Type', 'application/x-www-form-urlencoded' ],
			],
			withCredentials: true,
			body: {
				user_id: getTwoFactorUserId( store.getState() ),
				auth_type: authType,
				two_step_nonce: getTwoFactorAuthNonce( store.getState(), authType ),
				remember_me: getRememberMe( store.getState() ),
				two_step_push_token: getTwoFactorPushToken( store.getState() ),
				client_id: config( 'wpcom_signup_id' ),
				client_secret: config( 'wpcom_signup_key' ),
			},
		},
		action
	) );
};

const receivedTwoFactorPushNotificationApproved = ( { dispatch } ) =>
	dispatch( { type: TWO_FACTOR_AUTHENTICATION_PUSH_POLL_COMPLETED } );

/***
 * Receive error from the two factor push notification status http request
 *
 * @param {Object}	store  Global redux store
 * @param {Object}	action dispathced action
 * @param {Object}	error the error object
 */
const receivedTwoFactorPushNotificationError = ( store, action, next, error ) => {
	const twoStepNonce = get( error, 'response.body.data.two_step_nonce' );

	if ( ! twoStepNonce ) {
		store.dispatch( { type: TWO_FACTOR_AUTHENTICATION_PUSH_POLL_STOP } );
		throw new Error( "Two step nonce wasn't present on the response from polling endpoint, unable to continue" );
	}

	store.dispatch( {
		type: TWO_FACTOR_AUTHENTICATION_UPDATE_NONCE,
		nonceType: 'push',
		twoStepNonce,
	} );

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
	receivedTwoFactorPushNotificationError,
);

export default {
	[ TWO_FACTOR_AUTHENTICATION_PUSH_POLL_START ]: [ ( store, action ) => {
		// We need to store to update for `getTwoFactorPushPollInProgress` selector
		store.dispatch( local( action ) );
		return makePushNotificationRequest( store, action );
	} ],
};
