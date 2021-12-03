import wpcom from 'calypso/lib/wp';

export function checkAuthCode( domainName, authCode, onComplete ) {
	if ( ! domainName || ! authCode ) {
		onComplete( null, { success: false } );
		return;
	}

	wpcom.req
		.get( `/domains/${ encodeURIComponent( domainName ) }/inbound-transfer-check-auth-code`, {
			auth_code: authCode,
		} )
		.then( ( data ) => onComplete( null, data ) )
		.catch( ( error ) => onComplete( { error: error.error, message: error.message } ) );
}
