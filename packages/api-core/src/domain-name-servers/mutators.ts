import { wpcom } from '../wpcom-fetcher';

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
