/**
 * External dependencies
 */
var debug = require( 'debug' )( 'calypso:auth:store' );

/**
 * Internal dependencies
 */
import { createReducerStore } from 'lib/store';
import { actions as ActionTypes } from './constants';
import { errors as errorTypes } from './constants';
import * as OAuthToken from 'lib/oauth-token';

/**
 * Module variables
 */
const initialState = {
	requires2fa: false,
	pollCount: 0,
	unverified_token: null,
	inProgress: false,
	errorLevel: false,
	errorMessage: false
};

function handleAuthError( error, data ) {
	let stateChanges = {
		errorLevel: 'is-error',
		requires2fa: false,
		pushauth_token: null,
		inProgress: false
	};

	stateChanges.errorMessage = data && data.body ? data.body.error_description : error.message;

	debug( 'Error processing login: ' + stateChanges.errorMessage );

	if ( data && data.body ) {
		if ( data.body.error === errorTypes.ERROR_REQUIRES_2FA ) {
			stateChanges.errorLevel = 'is-info';
			if ( data.body.error_info && data.body.error_info.type === 'push-verification-sent' ) {
				stateChanges.requires2fa = 'push-verification';
				stateChanges.pushauth_token = {
					token: data.body.error_info.unverified_token,
					user_id: data.body.error_info.user_id
				};
			} else {
				stateChanges.requires2fa = 'code';
			}
		} else if ( data.body.error === errorTypes.ERROR_INVALID_OTP ) {
			stateChanges.requires2fa = 'code';
		}
	}

	return stateChanges;
}

function goToLogin() {
	document.location.replace( '/' );
}

function handleLogin( token ) {
	debug( 'Access token received' );

	OAuthToken.setToken( token );

	goToLogin();
}

const AuthStore = createReducerStore( function( state, payload ) {
	let stateChanges;
	const { action } = payload;

	switch ( action.type ) {
		case ActionTypes.AUTH_RESET:
			stateChanges = initialState;
			break;
		case ActionTypes.AUTH_LOGIN:
			stateChanges = { inProgress: true, errorLevel: false, errorMessage: false };
			break;
		case ActionTypes.RECEIVE_AUTH_LOGIN:
			if ( action.error ) {
				stateChanges = handleAuthError( action.error, action.data );
			} else {
				handleLogin( action.data.body.access_token );
			}
			break;
		case ActionTypes.RECEIVE_AUTH_TOKEN_INFO:
			if ( action.error ) {
				// XXX: this triggers component update, which in turn triggers polling
				//      too much indirection :(
				stateChanges = { pollCount: state.pollCount + 1 };
			} else {
				handleLogin( action.data.body.access_token );
			}
			break;
	}

	if ( stateChanges ) {
		return Object.assign( {}, state, stateChanges );
	}

	return state;
}, initialState );

export default AuthStore;
