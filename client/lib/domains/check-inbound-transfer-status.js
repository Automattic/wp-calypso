import wpcom from 'calypso/lib/wp';

export function checkInboundTransferStatus( domainName ) {
	if ( ! domainName ) {
		return Promise.reject( new Error( 'missing domain parameter' ) );
	}

	return wpcom.req.get( `/domains/${ encodeURIComponent( domainName ) }/inbound-transfer-status` );
}
