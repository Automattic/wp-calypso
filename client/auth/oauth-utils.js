/**
 * Internal dependencies
 */
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { bumpStat } from 'calypso/lib/analytics/mc';

export const errors = {
	ERROR_REQUIRES_2FA: 'needs_2fa', // From WP.com API
	ERROR_INVALID_OTP: 'invalid_otp', // From WP.com API
};

export async function makeAuthRequest( username, password, authCode = '' ) {
	const response = await globalThis.fetch( '/oauth', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify( {
			username,
			password,
			auth_code: authCode,
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

	if ( errorType === errors.ERROR_REQUIRES_2FA ) {
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
