/**
 * Availability status of a Name Pulse row. UNKNOWN (check failed or timed out)
 * rows stay visible without a verdict and are re-requested on the next search
 * or "Show more".
 */
export enum NamePulseDomainStatus {
	WAITING = 0,
	AVAILABLE = 1,
	TAKEN = 2,
	UNKNOWN = 3,
}

export type NamePulseSource = 'exact' | 'keyword';

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
	/** Set once a real-time check has run; bulk zone-file results never overwrite it. */
	is_realtime?: boolean;
	source: NamePulseSource;
}
