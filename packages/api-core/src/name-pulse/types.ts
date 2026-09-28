/**
 * Parameters for `GET /wpcom/v2/domains/name-pulse/suggestions`.
 */
export interface NamePulseSuggestionsQuery {
	query: string;

	/** AI-generated ("creative") suggestions. */
	use_ai?: boolean;

	/** How long the endpoint waits on its providers, in milliseconds. */
	timeout?: number;
}

export interface NamePulseSuggestion {
	domain_name: string;

	/** Between 0 and 1. */
	relevance: number;

	/** Formatted, e.g. "€13.00". */
	cost?: string;

	/** In the currency's main unit. */
	raw_price?: number;

	/** In the currency's main unit. */
	sale_cost?: number;

	currency_code?: string;
	is_premium?: boolean;
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
	is_available: boolean;
	is_premium?: boolean;

	/** Formatted, e.g. "$10.00". */
	cost?: string;
	raw_price?: number;
	sale_cost?: number;
	currency_code?: string;
}

/**
 * Response keyed by domain name.
 */
export type NamePulseAvailabilityResponse = Record< string, NamePulseAvailabilityEntry >;
