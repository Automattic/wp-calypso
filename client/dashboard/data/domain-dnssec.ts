import wpcom from 'calypso/lib/wp';

export interface DNSSECDSData {
	rdata: string;
	key_tag: number;
	algorithm: number;
	digest_type: number;
	digest: string;
}

export interface DNSSECDNSKey {
	rdata: string;
	flags: number;
	protocol: number;
	algorithm: number;
	public_key: string;
}

export interface DNSSECCryptokey {
	dnskey: DNSSECDNSKey;
	ds_data: DNSSECDSData[];
}

export type DNSSECResponse = {
	data?: {
		cryptokeys: DNSSECCryptokey[];
		dnssec_data_set_at_registry: boolean;
	} | null;
	status: string;
};

export async function updateDNSSEC( domain: string, enabled: boolean ): Promise< DNSSECResponse > {
	return wpcom.req.post( {
		path: `/domains/dnssec/${ domain }`,
		apiNamespace: 'wpcom/v2',
		...( ! enabled && { method: 'DELETE' } ),
	} );
}
