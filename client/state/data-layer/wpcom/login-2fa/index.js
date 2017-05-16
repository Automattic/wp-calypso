/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import config from 'config';
import {
	TWO_FACTOR_AUTHENTICATION_PUSH_UPDATE_NONCE,
	TWO_FACTOR_AUTHENTICATION_PUSH_POLL_COMPLETED,
	TWO_FACTOR_AUTHENTICATION_PUSH_POLL_START,
	TWO_FACTOR_AUTHENTICATION_PUSH_POLL_STOP,
} from 'state/action-types';
import {
	getTwoFactorUserId,
	getTwoFactorAuthNonce,
	getTwoFactorPushToken,
	getTwoFactorRememberMe,
	getTwoFactorPushPollInProgress
} from 'state/login/selectors';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { rawHttp } from 'state/data-layer/http/actions';

/***
 * Module constants
 */
const POLL_APP_PUSH_INTERVAL_SECONDS = 5;

/***
 * Dispatch action to perform http request
 *
 * @param {Object}	store  Global redux store
 * @param {Object}	action dispathced action
 */
const requestTwoFactorPushNotificationStatus = ( store, action ) => {
	store.dispatch( rawHttp( {
		url: 'https://wordpress.com/wp-login.php?action=two-step-authentication-endpoint',
		method: 'POST',
		headers: [
			[ 'Content-Type', 'application/x-www-form-urlencoded' ],
		],
		withCredentials: true,
		body: {
			user_id: getTwoFactorUserId( store.getState() ),
			two_step_nonce: getTwoFactorAuthNonce( store.getState() ),
			remember_me: getTwoFactorRememberMe( store.getState() ),
			two_step_push_token: getTwoFactorPushToken( store.getState() ),
			client_id: config( 'wpcom_signup_id' ),
			client_secret: config( 'wpcom_signup_key' ),
		}
	}, action ) );
};

/***
 * Receive data from the two factor push notification status http request
 *
 * @param {Function}	dispatch redux store dispatch function
 * @returns {*} dispatch result
 */
const receivedTwoFactorPushNotificationApproved = ( { dispatch } ) =>
	dispatch( { type: TWO_FACTOR_AUTHENTICATION_PUSH_POLL_COMPLETED } );

/***
 * Receive error from the two factor push notification status http request
 *
 * @param {Object}	store  Global redux store
 * @param {Object}	action dispathced action
 * @param {Function}	next continue dispatch function
 * @param {Object}	error the error object
 */
const receivedTwoFactorPushNotificationError = ( store, action, next, error ) => {
	const twoStepNonce = get( error, 'response.body.data.two_step_nonce' );

	if ( ! twoStepNonce ) {
		store.dispatch( { type: TWO_FACTOR_AUTHENTICATION_PUSH_POLL_STOP } ); //
		throw new Error( "Two step nonce wasn't present on the response from polling endpoint, unable to continue" );
	}

	store.dispatch( { type: TWO_FACTOR_AUTHENTICATION_PUSH_UPDATE_NONCE, twoStepNonce } );

	if ( getTwoFactorPushPollInProgress( store.getState() ) ) {
		setTimeout(
			// eslint-disable-next-line no-use-before-define
			() => makePushNotificationRequest( store, { type: action.type }, next ),
			POLL_APP_PUSH_INTERVAL_SECONDS * 1000
		);
	}
};

/***
 * Dispatch a two factor push notification status request with handlers
 */
const makePushNotificationRequest = dispatchRequest(
	requestTwoFactorPushNotificationStatus,
	receivedTwoFactorPushNotificationApproved,
	receivedTwoFactorPushNotificationError
);

/***
 * Starts polling for push notification status
 *
 * @param {Object}	store  Global redux store
 * @param {Object}	action dispatched action
 * @param {Function}	next continue dispatch function
 * @param {Object}	error the error object
 * @returns {*} whatever requestTwoFactorPushNotificationStatus returns, which is undefined
 */
const startPolling = ( store, action, next ) => {
	next( action ); // allow the reducer change status of polling to inProgress
	return makePushNotificationRequest( store, action, next );
};

export default {
	[ TWO_FACTOR_AUTHENTICATION_PUSH_POLL_START ]: [ startPolling ],
};
