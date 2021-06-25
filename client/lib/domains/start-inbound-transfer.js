/**
 * Internal dependencies
 */
import wpcom from 'calypso/lib/wp';

export function startInboundTransfer( siteId, domainName, authCode, onComplete ) {
	if ( ! domainName || ! siteId ) {
		onComplete( null );
		return;
	}

	wpcom
		.undocumented()
		.startInboundTransfer( siteId, domainName, authCode, function ( serverError, result ) {
			if ( serverError ) {
				onComplete( serverError.error );
				return;
			}

			onComplete( null, result );
		} );
}
