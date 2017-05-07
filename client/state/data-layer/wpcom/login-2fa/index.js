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
	LOGIN_TWOFACTOR_UPDATE_NONCE,
	LOGIN_TWOFACTOR_PUSH_POLL_COMPLETED,
	LOGIN_TWOFACTOR_PUSH_POLL_START,
} from 'state/action-types';
import {
	getTwoFactorUserId,
	getTwoFactorAuthNonce,
	getTwoFactorPushToken,
	getTwoFactorRememberMe,
	getTwoFactorPushPollInProgress
} from 'state/login/selectors';

/***
 * Module constants
 */
const POLL_APP_PUSH_INTERVAL_SECONDS = 5;

const doAppPushRequest = ( store ) => {
	return request.post( config( 'two_step_authentication_xhr' ) )
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
			store.dispatch( { type: LOGIN_TWOFACTOR_PUSH_POLL_COMPLETED } );
		} ).catch( error => {
			store.dispatch( { type: LOGIN_TWOFACTOR_UPDATE_NONCE, twoStepNonce: error.response.body.data.two_step_nonce } );
			return Promise.reject( error );
		} );
};

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
	defer( () => doAppPushPolling( store ) );
	return next( action );
};

export default {
	[ LOGIN_TWOFACTOR_PUSH_POLL_START ]: [ handleTwoFactorPushPoll ],
};
