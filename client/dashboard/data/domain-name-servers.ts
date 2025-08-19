import wpcom from 'calypso/lib/wp';

export async function fetchDomainNameServers( domainName: string ): Promise< string[] > {
	return wpcom.req.get( {
		path: `/domains/${ domainName }/nameservers`,
	} );
}

export async function updateDomainNameServers(
	domainName: string,
	nameServers: string[]
): Promise< string[] > {
	return wpcom.req.post( {
		path: `/domains/${ domainName }/nameservers`,
		body: {
			nameservers: nameServers.map( ( nameserver ) => ( { nameserver } ) ),
		},
	} );
}
