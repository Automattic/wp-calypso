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

export type DomainName = string;

export interface DomainSuggestion {
	/**
	 * The domain name
	 *
	 * @example "example.com"
	 */
	domain_name: DomainName;

	/**
	 * Relevance as a percent: 0 <= relevance <= 1
	 *
	 * @example 0.9
	 */
	relevance: number;

	/**
	 * Whether the domain supports privacy
	 */
	supports_privacy: boolean;

	/**
	 * The domain vendor
	 */
	vendor: string;

	/**
	 * Reasons for suggestion the domain
	 *
	 * @example [ "exact-match" ]
	 */
	match_reasons: string[];

	/**
	 * Rendered cost with currency
	 *
	 * @example "€15.00"
	 */
	cost: string;

	/**
	 * The product ID
	 */
	product_id: number;

	/**
	 * The product slug
	 */
	product_slug: string;

	/**
	 * Whether the domain is free
	 */
	is_free?: true;
}
