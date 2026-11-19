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

export type SslLastError = {
	error_type: string;
	message: string;
};

export type SslDetails = {
	certificate_provisioned: boolean;
	/**
	 * `failed` means automatic provisioning attempts have stopped.
	 */
	certificate_status?: 'active' | 'pending' | 'failed';
	certificate_expiry_date?: string;
	is_newly_registered: boolean;
	is_expired: boolean;
	last_attempt?: string;
	next_attempt?: string | null;
	/**
	 * Problems found by checks that run when the details are requested.
	 */
	failure_reasons?: SslFailureReason[];
	/**
	 * The error recorded for the last provisioning attempt.
	 */
	last_error?: SslLastError | null;
};
