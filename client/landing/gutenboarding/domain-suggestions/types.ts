// With a _real_ TypeScript compiler, we could use const enums.
/* const */ enum ActionType {
	RECEIVE_DOMAIN_SUGGESTIONS = 'RECEIVE_DOMAIN_SUGGESTIONS',
}
export { ActionType };

// See client/state/domains/suggestions/actions.js#requestDomainsSuggestions
export interface DomainSuggestionQuery {
	query: string; // Domain query
	quantity: number; // max results
	vendor: string; // vendor
	include_wordpressdotcom?: boolean; // adds wordpress subdomain suggestions when true
}

export type SerializedDomainsSuggestionsQuery = string;

export interface DomainSuggestion {
	domain_name: string;
	relevance: number; // Percentage, <= 1
	supports_privacy: boolean;
	vendor: string; // List of possible values? E.g. "dotdomains"
	match_reasons: string[]; // E.g. [ "exact-match" ]
	cost: string; // With currency, e.g. "€15.00"
	product_id: number;
	product_slug: string; // List of possible values? E.g. "dotart_domain"
}

/**
 * Parameters type of a function, excluding the first parameter.
 *
 * This is useful for typing some @wordpres/data functions that make a leading
 * `state` argument implicit.
 */
export type TailParameters< F extends ( head: any, ...tail: any[] ) => any > = F extends (
	head: any,
	...tail: infer PS
) => any
	? PS
	: never;
