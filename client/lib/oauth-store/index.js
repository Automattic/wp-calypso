/**
 * External dependencies
 */
import { get } from 'lodash/object';
const debug = require( 'debug' )( 'calypso:auth:store' );

/**
 * Internal dependencies
 */
import { createReducerStore } from 'lib/store';
import { actions as ActionTypes } from './constants';
import { errors } from './constants';
import * as OAuthToken from 'lib/oauth-token';

/**
 * Module variables
 */
const initialState = {
	required2faType: null,
	pushauth: null,
	inProgress: false,
	errorLevel: false,
	errorMessage: false
};

function handleAuthError( error, data ) {
	const errorMessage = get( data, 'body.error_description', error.message );
	const stateChanges = {
		errorMessage,
		errorLevel: 'is-error',
		required2faType: null,
		inProgress: false
	};

	debug( 'Error processing login: ' + stateChanges.errorMessage );

	const errorCode = get( data, 'body.error', null );
	const errorInfo = get( data, 'body.error_info', null );
	const errorChanges = get( {
		[ errors.ERROR_REQUIRES_2FA ]:
			{ errorLevel: 'is-info', required2faType: 'code' },
		[ errors.ERROR_REQUIRES_2FA_PUSH_VERIFICATION ]:
			{ errorLevel: 'is-info', required2faType: 'push-verification', pushauth: errorInfo },
		[ errors.ERROR_INVALID_PUSH_TOKEN ]:
			{ errorLevel: 'is-info', required2faType: 'push-verification' },
		[ errors.ERROR_INVALID_OTP ]:
			{ required2faType: 'code' }
	}, errorCode, {} );

	return { ...stateChanges, ...errorChanges };
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
		case ActionTypes.USE_AUTH_CODE:
			stateChanges = {
				required2faType: 'code',
				pushauth: null,
				errorLevel: 'is-info',
				errorMessage: action.data.message
			};
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
