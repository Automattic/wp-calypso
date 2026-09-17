/**
 * Availability status of a Name Pulse row. INVALID and ERROR rows are hidden
 * from grids; UNKNOWN (check failed or timed out) rows stay visible without a
 * verdict and are re-requested on the next search or "Show more".
 */
export enum NamePulseDomainStatus {
	WAITING = 0,
	AVAILABLE = 1,
	TAKEN = 2,
	INVALID = 3,
	ERROR = 4,
	UNKNOWN = 5,
}

export type NamePulseSource = 'exact' | 'fqdn' | 'keyword' | 'ai';

export interface NamePulseDomainResult {
	domain_name: string;
	/**
	 * TLD without the leading dot, multi-level aware ("co.uk").
	 */
	suffix: string;
	status: NamePulseDomainStatus;
	/** Formatted, e.g. "$22.00". */
	cost?: string;
	raw_price?: number;
	sale_cost?: number;
	currency_code?: string;
	is_premium?: boolean;
	product_id?: number;
	product_slug?: string;
	supports_privacy?: boolean;
	/** Set once a real-time check has run; bulk zone-file results never overwrite it. */
	is_realtime?: boolean;
	source: NamePulseSource;
	relevance?: number;
	vendor?: string;
}

export type NamePulseDomainUpdate = Partial< NamePulseDomainResult > & { domain_name: string };
