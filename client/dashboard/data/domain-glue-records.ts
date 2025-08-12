import wpcom from 'calypso/lib/wp';

export interface DomainGlueRecord {
	nameserver: string;
	ip_addresses: string[];
}

export function fetchDomainGlueRecords( domainName: string ): Promise< DomainGlueRecord[] > {
	return wpcom.req.get( {
		path: `/domains/glue-records/${ domainName }`,
		apiNamespace: 'wpcom/v2',
	} );
}
