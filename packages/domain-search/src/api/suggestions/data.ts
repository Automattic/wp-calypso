import wpcomProxyRequest from 'wpcom-proxy-request';

export const fetchDomainSuggestions = async (
	query: DomainSuggestionQuery
): Promise< DomainSuggestion[] > => {
	return wpcomProxyRequest( {
		apiVersion: '1.1',
		path: '/domains/suggestions',
		query: new URLSearchParams( Object.entries( query ) ).toString(),
	} );
};

export interface DomainSuggestion {
	/**
	 * The domain name
	 * @example "example.com"
	 */
	domain_name: string;

	/**
	 * Rendered formatted cost
	 * @example "Free" or "€15.00"
	 */
	cost: string;

	/**
	 * Rendered formatted renew cost
	 * @example "Free" or "€15.00"
	 */
	renew_cost?: string;

	/**
	 * Rendered formatted sale cost
	 * @example "Free" or "€15.00"
	 */
	sale_cost?: string;

	/**
	 * Currency code
	 * @example USD
	 */
	currency_code: string;

	/**
	 * Relevance as a percent: 0 <= relevance <= 1
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
	 * @example [ "exact-match" ]
	 */
	match_reasons: readonly string[];

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
	is_free?: boolean;
}

export interface DomainSuggestionQuery {
	/**
	 * True to include .blog subdomain suggestions
	 * @example
	 * example.photo.blog
	 */
	include_dotblogsubdomain?: boolean;

	/**
	 * True to include WordPress.com subdomain suggestions
	 * @example
	 * example.wordpress.com
	 */
	include_wordpressdotcom?: boolean;

	/**
	 * True to include domains registered with wpcom in the response
	 */
	include_internal_move_eligible?: boolean;

	/**
	 * Localizes domain results, e.g., price format
	 */
	locale?: string;

	/**
	 * True to only provide a wordpress.com subdomain
	 * @example
	 * example.wordpress.com
	 */
	only_wordpressdotcom?: boolean;

	/**
	 * Desired number of results
	 */
	quantity?: number;

	/**
	 * Domain search term
	 */
	query: string;

	recommendation_context?: string;

	/**
	 * Vendor
	 */
	vendor?: string;

	/**
	 * The vertical id or slug
	 */
	vertical?: string;

	/**
	 * An array of tlds
	 */
	tlds?: readonly string[];
}
