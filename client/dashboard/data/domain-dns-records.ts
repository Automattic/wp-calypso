import wpcom from 'calypso/lib/wp';

export type DNSRecordType = 'A' | 'AAAA' | 'ALIAS' | 'CAA' | 'CNAME' | 'MX' | 'NS' | 'SRV' | 'TXT';

export type DNSRecord = {
	type?: DNSRecordType;
	name: string;
	flags?: number;
	tag?: string;
	value?: string;
	target?: string;
	data?: string;
	weight?: number;
	port?: number;
	aux?: number;
	service?: string;
	protocol?: string;
	ttl: number;
};

export type AddDNSRecordResponse = {
	records: DNSRecord[];
};

export async function addDNSRecord(
	domain: string,
	recordData: DNSRecord
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
