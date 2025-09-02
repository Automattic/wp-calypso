import { wpcom } from '../wpcom-fetcher';

interface FetchNameServersResponse {
	is_using_default_nameservers: boolean;
	nameservers: string[];
}

export interface DomainNameServersResponse {
	nameServers: string[];
	isUsingDefaultNameServers: boolean;
}

export async function fetchDomainNameServers(
	domainName: string
): Promise< DomainNameServersResponse > {
	return wpcom.req
		.get( {
			path: `/domains/${ domainName }/nameservers`,
			apiVersion: '1.2',
		} )
		.then( ( data: FetchNameServersResponse ) => {
			return {
				nameServers: data.nameservers,
				isUsingDefaultNameServers: data.is_using_default_nameservers,
			};
		} );
}
