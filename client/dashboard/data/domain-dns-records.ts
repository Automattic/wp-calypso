import wpcom from 'calypso/lib/wp';

export type DnsRecordType = 'A' | 'AAAA' | 'ALIAS' | 'CAA' | 'CNAME' | 'MX' | 'NS' | 'SRV' | 'TXT';

export type DnsRecord = {
	aux?: number;
	data?: string;
	domain: string;
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

export type AddDNSRecordResponse = {
	records: DnsRecord[];
};

export async function addDNSRecord(
	domain: string,
	recordData: DnsRecord
): Promise< AddDNSRecordResponse > {
	const payload = {
		dns: JSON.stringify( {
			records_to_add: [ recordData ],
		} ),
	};

	return wpcom.req.post(
		{
			path: `/domains/${ domain }/dns`,
			apiVersion: '1.1',
		},
		payload
	);
}
