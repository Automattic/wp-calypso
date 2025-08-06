import wpcom from 'calypso/lib/wp';

export interface DNSRecord {
	type: string;
	name: string;
	data: string;
	ttl: number;
}

export type AddDNSRecordResponse = {
	data?: {
		records: DNSRecord[];
	} | null;
	status: string;
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
	console.log( 'payload = ' );
	console.log( payload );

	return wpcom.req.post(
		{
			path: `/domains/${ domain }/dns`,
			apiVersion: '1.1',
		},
		payload
	);
}
