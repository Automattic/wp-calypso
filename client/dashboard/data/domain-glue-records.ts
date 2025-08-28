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

export function createDomainGlueRecord( glueRecord: DomainGlueRecord ): Promise< void > {
	return wpcom.req.post(
		{
			path: '/domains/glue-records',
			apiNamespace: 'wpcom/v2',
		},
		{
			name_server: glueRecord.nameserver,
			ip_addresses: glueRecord.ip_addresses,
		}
	);
}

export function updateDomainGlueRecord( glueRecord: DomainGlueRecord ): Promise< void > {
	return wpcom.req.put(
		{
			path: '/domains/glue-records',
			apiNamespace: 'wpcom/v2',
			method: 'PUT',
		},
		{
			name_server: glueRecord.nameserver,
			ip_addresses: glueRecord.ip_addresses,
		}
	);
}

export function deleteDomainGlueRecord(
	domainName: string,
	glueRecord: DomainGlueRecord
): Promise< void > {
	return wpcom.req.post(
		{
			path: `/domains/glue-records/${ domainName }`,
			apiNamespace: 'wpcom/v2',
			method: 'DELETE',
		},
		{
			name_server: glueRecord.nameserver,
		}
	);
}
