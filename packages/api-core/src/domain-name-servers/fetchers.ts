import { wpcom } from '../wpcom-fetcher';

export async function fetchDomainNameServers( domainName: string ): Promise< string[] > {
	return wpcom.req.get( {
		path: `/domains/${ domainName }/nameservers`,
	} );
}
