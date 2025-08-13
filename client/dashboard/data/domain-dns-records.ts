import wpcom from 'calypso/lib/wp';

export type DnsRecordType = 'A' | 'AAAA' | 'ALIAS' | 'CAA' | 'CNAME' | 'MX' | 'NS' | 'SRV' | 'TXT';

export type DnsRecord = {
	aux?: number;
	data?: string;
	domain?: string;
	flags?: number;
	id?: string;
	name: string;
	port?: number;
	protected_field?: boolean;
	protocol?: string;
	service?: string;
	tag?: string;
	target?: string;
	ttl?: number;
	type: DnsRecordType;
	value?: string;
	weight?: number;
};

export type DnsResponse = {
	records: DnsRecord[];
};

export function fetchDomainDns( domainName: string ): Promise< DnsResponse > {
	return wpcom.req.get( {
		path: `/domains/${ domainName }/dns`,
		apiVersion: '1.1',
	} );
}

export function updateDomainDns(
	domainName: string,
	recordsToAdd?: DnsRecord[],
	recordsToRemove?: DnsRecord[],
	restoreDefaultARecords?: boolean
): Promise< DnsResponse > {
	return wpcom.req.post( {
		path: `/domains/${ domainName }/dns`,
		apiVersion: '1.1',
		body: {
			dns: JSON.stringify( {
				records_to_add: recordsToAdd,
				records_to_remove: recordsToRemove,
				restore_default_a_records: restoreDefaultARecords,
			} ),
		},
	} );
}

export function restoreDefaultEmailRecords( domainName: string ): Promise< void > {
	return wpcom.req.post( {
		path: '/domains/dns/email/set-default-records',
		apiNamespace: 'wpcom/v2',
		body: {
			domain: domainName,
		},
	} );
}
