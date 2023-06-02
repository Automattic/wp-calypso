import wpcom from 'calypso/lib/wp';

export function startInboundTransfer( siteId, domain, authCode ) {
	if ( ! domain || ! siteId ) {
		return Promise.reject( new Error( 'Missing siteId or domain' ) );
	}

	return wpcom.req.get(
		`/domains/${ encodeURIComponent( domain ) }/inbound-transfer-start/${ siteId }`,
		authCode ? { auth_code: authCode } : {}
	);
}
