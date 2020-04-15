export interface DomainSuggestionQuery {
	/**
	 * True to include .blog subdomain suggestions
	 *
	 * @example
	 * example.photo.blog
	 */
	include_dotblogsubdomain: boolean;

	/**
	 * True to include WordPress.com subdomain suggestions
	 *
	 * @example
	 * example.wordpress.com
	 */
	include_wordpressdotcom: boolean;

	/**
	 * Localizes domain results, e.g., price format
	 */
	locale?: string;

	/**
	 * True to only provide a wordpress.com subdomain
	 *
	 * @example
	 * example.wordpress.com
	 */
	only_wordpressdotcom: boolean;

	/**
	 * Desired number of results
	 */
	quantity: number;

	/**
	 * Domain search term
	 */
	query: string;

	recommendation_context?: string;

	/**
	 * Vendor
	 */
	vendor: string;

	/**
	 * The vertical id or slug
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
	match_reasons?: string[];

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
