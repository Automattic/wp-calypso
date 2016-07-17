/**
 * External dependencies
 */
const debug = require( 'debug' )( 'calypso:auth:store' );

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
	pushauth: null,
	inProgress: false,
	errorLevel: false,
	errorMessage: false
};

function handleAuthError( error, data ) {
	const stateChanges = {
		errorLevel: 'is-error',
		requires2fa: false,
		pushauth: null,
		inProgress: false
	};

	stateChanges.errorMessage = data && data.body ? data.body.error_description : error.message;

	debug( 'Error processing login: ' + stateChanges.errorMessage );

	if ( data && data.body ) {
		if ( data.body.error === errorTypes.ERROR_REQUIRES_2FA ) {
			stateChanges.errorLevel = 'is-info';
			stateChanges.requires2fa = 'code';
		} else if ( data.body.error === errorTypes.ERROR_REQUIRES_2FA_PUSH_VERIFICATION ) {
			stateChanges.errorLevel = 'is-info';
			stateChanges.requires2fa = 'push-verification';
			stateChanges.pushauth = data.body.error_info;
		} else if ( data.body.error === errorTypes.ERROR_INVALID_PUSH_TOKEN ) {
			stateChanges.errorLevel = 'is-info';
			stateChanges.requires2fa = 'push-verification';
			delete stateChanges.pushauth; // keep push token / user id
		} else if ( data.body.error === errorTypes.ERROR_INVALID_OTP ) {
			stateChanges.requires2fa = 'code';
		}
	}

	return stateChanges;
}

function goToLogin() {
	document.location.replace( '/' );
}

function handleLogin( response ) {
	debug( 'Access token received' );

	OAuthToken.setToken( response.body.access_token );

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
		case ActionTypes.PUSH_AUTH_LOGIN:
			stateChanges = { };
			break;
		case ActionTypes.RECEIVE_AUTH_LOGIN:
			if ( action.error ) {
				stateChanges = handleAuthError( action.error, action.data );
			} else {
				handleLogin( action.data );
			}
			break;
	}

	if ( stateChanges ) {
		return Object.assign( {}, state, stateChanges );
	}

	return state;
}, initialState );

export default AuthStore;
