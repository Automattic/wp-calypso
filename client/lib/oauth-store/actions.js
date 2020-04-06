/**
 * Internal dependencies
 */
import Dispatcher from 'dispatcher';
import { actions, errors as errorTypes } from './constants';
import analytics from 'lib/analytics';
import { bumpStat } from 'lib/analytics/mc';

async function makeRequest( username, password, authCode = '' ) {
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

export function login( username, password, authCode ) {
	Dispatcher.handleViewAction( {
		type: actions.AUTH_LOGIN,
	} );

	makeRequest( username, password, authCode ).then( ( [ error, response ] ) => {
		bumpStats( error, response );

		Dispatcher.handleServerAction( {
			type: actions.RECEIVE_AUTH_LOGIN,
			data: response,
			error,
		} );
	} );
}

function bumpStats( error, data ) {
	let errorType;

	if ( error ) {
		if ( data && data.body ) {
			errorType = data.body.error;
		} else {
			errorType = 'status_' + error.status;
		}
	}

	if ( errorType === errorTypes.ERROR_REQUIRES_2FA ) {
		analytics.tracks.recordEvent( 'calypso_oauth_login_needs2fa' );
		bumpStat( 'calypso_oauth_login', 'success-needs-2fa' );
	} else if ( errorType ) {
		analytics.tracks.recordEvent( 'calypso_oauth_login_fail', {
			error: error.error,
		} );

		bumpStat( {
			calypso_oauth_login_error: errorType,
			calypso_oauth_login: 'error',
		} );
	} else {
		analytics.tracks.recordEvent( 'calypso_oauth_login_success' );
		bumpStat( 'calypso_oauth_login', 'success' );
	}
}
