/**
 * External dependencies
 */

import debugFactory from 'debug';

const debug = debugFactory( 'calypso:auth:store' );

/**
 * Internal dependencies
 */
import * as OAuthToken from 'calypso/lib/oauth-token';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { bumpStat } from 'calypso/lib/analytics/mc';
import { errors as errorTypes } from './constants';

export async function makeRequest( username, password, authCode = '' ) {
	const response = await globalThis.fetch( '/oauth', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify( {
			username,
			password,
			auth_code: authCode.replace( /\s/g, '' ),
		} ),
	} );

	const json = await response.json();
	const errorMessage = json?.error_description ?? '';

	if ( errorMessage ) {
		const error = new Error( errorMessage );
		error.type = json.error;

		throw error;
	}

	return { ok: response.ok, status: response.status, body: json };
}

export function bumpStats( error ) {
	const errorType = error.type ? error.type : `status_${ error.status }`;

	if ( errorType === errorTypes.ERROR_REQUIRES_2FA ) {
		recordTracksEvent( 'calypso_oauth_login_needs2fa' );
		bumpStat( 'calypso_oauth_login', 'success-needs-2fa' );
	} else if ( errorType ) {
		recordTracksEvent( 'calypso_oauth_login_fail', {
			error: error.error,
		} );

		bumpStat( {
			calypso_oauth_login_error: errorType,
			calypso_oauth_login: 'error',
		} );
	} else {
		recordTracksEvent( 'calypso_oauth_login_success' );
		bumpStat( 'calypso_oauth_login', 'success' );
	}
}

export function handleAuthError( error ) {
	const stateChanges = {
		errorLevel: 'is-error',
		requires2fa: false,
		inProgress: false,
		errorMessage: error.message,
	};

	debug( 'Error processing login: ' + stateChanges.errorMessage );

	if ( error.type === errorTypes.ERROR_REQUIRES_2FA ) {
		stateChanges.requires2fa = true;
		stateChanges.errorLevel = 'is-info';
	} else if ( error.type === errorTypes.ERROR_INVALID_OTP ) {
		stateChanges.requires2fa = true;
	}

	return stateChanges;
}

export function handleLogin( response ) {
	debug( 'Access token received' );

	OAuthToken.setToken( response.body.access_token );

	document.location.replace( '/' );
}
