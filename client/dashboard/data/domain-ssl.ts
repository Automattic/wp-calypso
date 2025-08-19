import wpcom from 'calypso/lib/wp';

export type DnsRawRecord = {
	host: string;
	class: string;
	type: string;
	ttl: number;
	target?: string;
	ip?: string;
};

export type SslFailureReason = {
	error_type: string;
	message: string;
	records: DnsRawRecord[];
};

export type SslDetails = {
	certificate_provisioned: boolean;
	certificate_expiry_date?: string;
	is_newly_registered: boolean;
	is_expired: boolean;
	last_attempt?: string;
	next_attempt?: string;
	failure_reasons?: SslFailureReason[];
};

export type SslDetailsResponse = {
	data: SslDetails;
	status: string;
};

export function fetchSslDetails( domainName: string ): Promise< SslDetailsResponse > {
	return wpcom.req.get( {
		path: `/domains/ssl/${ domainName }`,
		apiNamespace: 'wpcom/v2',
	} );
}

export function provisionSslCertificate( domainName: string ): Promise< void > {
	return wpcom.req.post( {
		path: `/domains/ssl/${ domainName }`,
		apiNamespace: 'wpcom/v2',
	} );
}
