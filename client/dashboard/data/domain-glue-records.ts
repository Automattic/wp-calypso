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

export function deleteDomainGlueRecord( domainName: string, nameServer: string ): Promise< void > {
	return wpcom.req.post(
		{
			path: `/domains/glue-records/${ domainName }`,
			apiNamespace: 'wpcom/v2',
			method: 'DELETE',
		},
		{
			name_server: nameServer,
		}
	);
}
