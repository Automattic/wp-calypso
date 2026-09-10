/**
 * Parameters for `GET /wpcom/v2/domains/name-pulse/suggestions`.
 */
export interface NamePulseSuggestionsQuery {
	/**
	 * Free-text search term (one or more words).
	 */
	query: string;

	/**
	 * Ask providers for AI-generated ("creative") suggestions. Sent as `use_ai=1|0`.
	 */
	use_ai?: boolean;

	/**
	 * Provider list, sent comma-joined. The endpoint currently only honours
	 * `verisign` and `domainsbot` (`donuts` is filtered out server-side).
	 */
	providers?: string[];

	/**
	 * Backend timeout in milliseconds. Only sent when set; the UI passes it in AI mode.
	 */
	timeout?: number;

	/**
	 * Restrict suggestions to these TLDs (comma-joined).
	 */
	tlds?: string[];

	/**
	 * Desired number of suggestions.
	 */
	quantity?: number;

	/**
	 * Include premium domains. Defaults to true.
	 */
	allow_premium?: boolean;
}

export interface NamePulseSuggestion {
	/**
	 * @example "coffeegoodies.com"
	 */
	domain_name: string;

	/**
	 * Relevance as a percent: 0 <= relevance <= 1
	 */
	relevance: number;

	/**
	 * Comma-separated list of providers that returned the name.
	 * @example "verisign,domainsbot"
	 */
	vendor: string;

	match_reasons?: string[];

	/**
	 * Rendered formatted cost
	 * @example "€13.00"
	 */
	cost?: string;

	/**
	 * Raw price in the currency's main unit
	 * @example 13
	 */
	raw_price?: number;

	/**
	 * Sale price in the currency's main unit
	 */
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
	/**
	 * Per-provider failures. Partial results are still usable when this is non-empty.
	 */
	errors: NamePulseProviderError[];
}

/**
 * One entry of the `POST /wpcom/v2/domains/name-pulse/availability-check` response.
 * Unavailable domains only carry `{ is_available: false }`.
 */
export interface NamePulseAvailabilityEntry {
	domain_name?: string;
	is_available: boolean;
	is_premium?: boolean;

	/**
	 * Rendered formatted cost
	 * @example "$10.00"
	 */
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
