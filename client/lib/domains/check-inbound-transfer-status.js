/**
 * Internal dependencies
 */
import wpcom from 'calypso/lib/wp';

export function checkInboundTransferStatus( domainName, onComplete ) {
	if ( ! domainName ) {
		onComplete( null );
		return;
	}

	wpcom.undocumented().getInboundTransferStatus( domainName, function ( serverError, result ) {
		if ( serverError ) {
			onComplete( serverError.error );
			return;
		}

		onComplete( null, result );
	} );
}
