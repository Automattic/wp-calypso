import wpcom from 'calypso/lib/wp';

export function checkInboundTransferStatus( domainName ) {
	return new Promise( ( resolve ) => {
		if ( ! domainName ) {
			resolve( { error: null } );
		}

		wpcom.req
			.get( `/domains/${ encodeURIComponent( domainName ) }/inbound-transfer-status` )
			.then( ( data ) => {
				resolve( { error: null, data: data } );
			} )
			.catch( ( error ) => {
				resolve( { error: error.error } );
			} );
	} );
}
