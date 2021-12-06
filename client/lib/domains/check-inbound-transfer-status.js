import wpcom from 'calypso/lib/wp';

export function checkInboundTransferStatus( domainName, onComplete ) {
	if ( ! domainName ) {
		onComplete( null );
		return;
	}

	wpcom.req
		.get( `/domains/${ encodeURIComponent( domainName ) }/inbound-transfer-status` )
		.then( ( data ) => {
			onComplete( null, data );
		} )
		.catch( ( error ) => {
			onComplete( error.error );
		} );
}
