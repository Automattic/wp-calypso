enum ActionType {
	RECEIVE_DOMAIN_SUGGESTIONS = 'RECEIVE_DOMAIN_SUGGESTIONS',
}
export { ActionType };

// See client/state/domains/suggestions/actions.js#requestDomainsSuggestions
export interface DomainSuggestionQuery {
	/**
	 * Domain query
	 */
	query: string;

	/**
	 * Number of results
	 */
	quantity: number;

	/**
	 * Vendor
	 */
	vendor: string;

	/**
	 * True to include WordPress.com subdomain suggestions
	 */
	include_wordpressdotcom: boolean;

	recommendation_context?: string;

	/**
	 * The site vertical
	 */
	vertical?: string;
}

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
