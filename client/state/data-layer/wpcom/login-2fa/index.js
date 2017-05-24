/**
 * External dependencies
 */
import request from 'superagent';
import defer from 'lodash/defer';

/**
 * Internal dependencies
 */
import config from 'config';
import {
	TWO_FACTOR_AUTHENTICATION_PUSH_UPDATE_NONCE,
	TWO_FACTOR_AUTHENTICATION_PUSH_UPDATE_WEB_TOKEN,
	TWO_FACTOR_AUTHENTICATION_PUSH_POLL_COMPLETED,
	TWO_FACTOR_AUTHENTICATION_PUSH_POLL_START,
} from 'state/action-types';
import {
	getTwoFactorUserId,
	getTwoFactorAuthNonce,
	getTwoFactorPushToken,
	getTwoFactorRememberMe,
	getTwoFactorPushPollInProgress
} from 'state/login/selectors';
import queueOperation from 'lib/queued-operation';

/***
 * Module constants
 */
const POLL_APP_PUSH_INTERVAL_SECONDS = 5;

/***
 * Checks the status of the push notification auth
 *
 * @param {Object}   store  Global redux store
 * @returns {Promise}		Promise of result from the API
 */
const doAppPushRequest = ( store ) => {
	return queueOperation( 'two_step_nonce',
		() => {
			if ( ! getTwoFactorPushPollInProgress( store.getState() ) ) {
				return Promise.reject( new Error( 'Polling have been stopped' ) );
			}

			return request.post( 'https://wordpress.com/wp-login.php?action=two-step-authentication-endpoint' )
				.withCredentials()
				.set( 'Content-Type', 'application/x-www-form-urlencoded' )
				.accept( 'application/json' )
				.send( {
					user_id: getTwoFactorUserId( store.getState() ),
					two_step_nonce: getTwoFactorAuthNonce( store.getState() ),
					remember_me: getTwoFactorRememberMe( store.getState() ),
					two_step_push_token: getTwoFactorPushToken( store.getState() ),
					client_id: config( 'wpcom_signup_id' ),
					client_secret: config( 'wpcom_signup_key' ),
				} ).then( () => {
					store.dispatch( { type: TWO_FACTOR_AUTHENTICATION_PUSH_POLL_COMPLETED } );
				} ).catch( error => {
					store.dispatch( {
						type: TWO_FACTOR_AUTHENTICATION_PUSH_UPDATE_NONCE,
						twoStepNonce: error.response.body.data.two_step_nonce
					} );
					return Promise.reject( error );
				} );
		}
	);
};

const sendAppPush = ( store ) => {
	return queueOperation(
		'two_step_nonce',
		() => request.post( 'https://wordpress.com/wp-login.php?action=send-push-notification-endpoint' )
			.withCredentials()
			.set( 'Content-Type', 'application/x-www-form-urlencoded' )
			.accept( 'application/json' )
			.send( {
				user_id: getTwoFactorUserId( store.getState() ),
				two_step_nonce: getTwoFactorAuthNonce( store.getState() ),
				client_id: config( 'wpcom_signup_id' ),
				client_secret: config( 'wpcom_signup_key' ),
			} ).then( response => {
				store.dispatch( {
					type: TWO_FACTOR_AUTHENTICATION_PUSH_UPDATE_NONCE,
					twoStepNonce: response.body.data.two_step_nonce
				} );
				store.dispatch( {
					type: TWO_FACTOR_AUTHENTICATION_PUSH_UPDATE_WEB_TOKEN,
					pushWebToken: response.body.data.push_web_token
				} );
			} ).catch( error => {
				store.dispatch( {
					type: TWO_FACTOR_AUTHENTICATION_PUSH_UPDATE_NONCE,
					twoStepNonce: error.response.body.data.two_step_nonce
				} );
				return Promise.reject( error );
			} )
	);
};

/***
 * Polling the login API for the status of the push notification.
 * The polling will stop on success or when store's polling progress
 * state changes to `false`
 *
 * @param {Object}   store  Global redux store
 */
const doAppPushPolling = store => {
	let retryCount = 0;
	const retry = () => {
		// if polling was stopped or not in progress - stop
		if ( ! getTwoFactorPushPollInProgress( store.getState() ) ) {
			return;
		}

		retryCount++;
		setTimeout(
			() => doAppPushRequest( store ).catch( retry ),
			( POLL_APP_PUSH_INTERVAL_SECONDS + Math.floor( retryCount / 10 ) ) * 1000 // backoff lineary
		);
	};

	if ( getTwoFactorPushPollInProgress( store.getState() ) ) {
		doAppPushRequest( store ).catch( retry );
	}
};

const handleTwoFactorPushPoll = ( store, action, next ) => {
	// this is deferred to allow reducer respond to TWO_FACTOR_AUTHENTICATION_PUSH_POLL_START
	defer( () => {
		sendAppPush( store ).then( () => doAppPushPolling( store ) );
	} );
	return next( action );
};

export default {
	[ TWO_FACTOR_AUTHENTICATION_PUSH_POLL_START ]: [ handleTwoFactorPushPoll ],
};
