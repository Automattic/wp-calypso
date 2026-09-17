/**
 * Parameters for `GET /wpcom/v2/domains/name-pulse/suggestions`.
 */
export interface NamePulseSuggestionsQuery {
	query: string;

	/** AI-generated ("creative") suggestions. */
	use_ai?: boolean;

	/** Only `verisign` and `domainsbot` are honoured; `donuts` is filtered out server-side. */
	providers?: string[];

	/** Backend timeout in milliseconds. */
	timeout?: number;

	tlds?: string[];

	quantity?: number;

	/** Defaults to true. */
	allow_premium?: boolean;
}

export interface NamePulseSuggestion {
	domain_name: string;

	/** Between 0 and 1. */
	relevance: number;

	/** Providers that returned the name, comma-separated ("verisign,domainsbot"). */
	vendor: string;

	match_reasons?: string[];

	/** Formatted, e.g. "€13.00". */
	cost?: string;

	/** In the currency's main unit. */
	raw_price?: number;

	/** In the currency's main unit. */
	sale_cost?: number;

	currency_code?: string;
	renew_cost?: string;
	renew_raw_price?: number;
	is_premium?: boolean;
	supports_privacy?: boolean;
	product_id?: number;
	product_slug?: string;
	max_reg_years?: number;
	multi_year_reg_allowed?: boolean;
}

export interface NamePulseProviderError {
	provider: string;
	code: string;
	message: string;
}

export interface NamePulseSuggestionsResponse {
	suggestions: NamePulseSuggestion[];
	/** Partial results are still usable when this is non-empty. */
	errors: NamePulseProviderError[];
}

/**
 * Unavailable domains only carry `{ is_available: false }`.
 */
export interface NamePulseAvailabilityEntry {
	domain_name?: string;
	is_available: boolean;
	is_premium?: boolean;

	/** Formatted, e.g. "$10.00". */
	cost?: string;
	raw_price?: number;
	sale_cost?: number;
	currency_code?: string;
	renew_cost?: string;
	renew_raw_price?: number;
	product_id?: number;
	product_slug?: string;
	supports_privacy?: boolean;
}

/**
 * Response keyed by domain name.
 */
export type NamePulseAvailabilityResponse = Record< string, NamePulseAvailabilityEntry >;

/**
 * Hard limit enforced by the availability-check endpoint.
 */
export const NAME_PULSE_AVAILABILITY_MAX_DOMAINS = 50;
