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
	try {
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
		const errorMessage = ( json && json.error_description ) || '';

		return [
			response.ok ? null : new Error( errorMessage ),
			{ ok: response.ok, status: response.status, body: json },
		];
	} catch ( error ) {
		return [ error, null ];
	}
}

export function bumpStats( error, data ) {
	let errorType;

	if ( error ) {
		if ( data && data.body ) {
			errorType = data.body.error;
		} else {
			errorType = 'status_' + error.status;
		}
	}

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

export function handleAuthError( error, data ) {
	const stateChanges = { errorLevel: 'is-error', requires2fa: false, inProgress: false };

	stateChanges.errorMessage = data && data.body ? data.body.error_description : error.message;

	debug( 'Error processing login: ' + stateChanges.errorMessage );

	if ( data && data.body ) {
		if ( data.body.error === errorTypes.ERROR_REQUIRES_2FA ) {
			stateChanges.requires2fa = true;
			stateChanges.errorLevel = 'is-info';
		} else if ( data.body.error === errorTypes.ERROR_INVALID_OTP ) {
			stateChanges.requires2fa = true;
		}
	}

	return stateChanges;
}

export function handleLogin( response ) {
	debug( 'Access token received' );

	OAuthToken.setToken( response.body.access_token );

	// go to login
	document.location.replace( '/' );
}
