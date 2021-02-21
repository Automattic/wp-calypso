/**
 * Internal dependencies
 */
import wpcom from 'calypso/lib/wp';

export function checkAuthCode( domainName, authCode, onComplete ) {
	if ( ! domainName || ! authCode ) {
		onComplete( null, { success: false } );
		return;
	}

	wpcom.undocumented().checkAuthCode( domainName, authCode, function ( serverError, result ) {
		if ( serverError ) {
			onComplete( { error: serverError.error, message: serverError.message } );
			return;
		}

		onComplete( null, result );
	} );
}
