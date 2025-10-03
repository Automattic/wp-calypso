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
