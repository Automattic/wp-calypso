import wpcom from 'calypso/lib/wp';

export type DnsRecordType = 'MX' | 'A' | 'SRV' | 'TXT' | 'AAAA' | 'CNAME' | 'NS';

export type DnsRecord = {
	domain: string;
	id: string;
	name: string;
	protected_field: boolean;
	type: DnsRecordType;
	target?: string;
	data?: string;
	weight?: number;
	port?: number;
	aux?: number;
	service?: string;
	protocol?: string;
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
