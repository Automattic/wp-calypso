import wpcom from 'calypso/lib/wp';

export async function fetchDomainNameServers( domainName: string ): Promise< string[] > {
	return wpcom.req.get( {
		path: `/domains/${ domainName }/nameservers/`,
	} );
}

export async function updateDomainNameServers(
	domainName: string,
	nameservers: string[]
): Promise< string[] > {
	return wpcom.req
		.post( {
			path: `/domains/${ domainName }/nameservers`,
			body: {
				nameservers: nameservers.map( ( nameserver ) => ( { nameserver } ) ),
			},
		} )
		.then( ( response: { success: boolean } ) => {
			if ( response.success ) {
				return nameservers;
			}

			throw new Error( 'Failed to update nameservers' );
		} );
}
