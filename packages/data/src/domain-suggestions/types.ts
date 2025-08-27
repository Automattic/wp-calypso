export interface DomainSuggestionQuery {
	/**
	 * True to include .blog subdomain suggestions
	 * @example
	 * example.photo.blog
	 */
	include_dotblogsubdomain: boolean;

	/**
	 * True to include WordPress.com subdomain suggestions
	 * @example
	 * example.wordpress.com
	 */
	include_wordpressdotcom: boolean;

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

	/**
	 * An array of tlds
	 */
	tlds?: readonly string[];

	/**
	 * Domain category slug
	 */
	category_slug?: string;
}

export interface DomainSuggestion {
	/**
	 * Rendered formatted cost
	 * @example "Free" or "€15.00"
	 */
	cost: string;

	/**
	 * Currency code
	 * @example USD
	 */
	currency_code: string;

	/**
	 * The domain name
	 * @example "example.com"
	 */
	domain_name: string;

	/**
	 * Reasons for suggestion the domain
	 * @example [ "exact-match" ]
	 */
	match_reasons: string[];

	/**
	 * Maximum number of years the domain can be registered for
	 * @example 10
	 */
	max_reg_years: number;

	/**
	 * Whether the domain supports multi-year registration
	 * @example true
	 */
	multi_year_reg_allowed: boolean;

	/**
	 * The product ID
	 * @example 123
	 */
	product_id: number;

	/**
	 * The product slug
	 * @example "dotblog_domain"
	 */
	product_slug: string;

	/**
	 * Raw price
	 * @example 40
	 */
	raw_price: number;

	/**
	 * Relevance as a percent: 0 <= relevance <= 1
	 * @example 0.9
	 */
	relevance: number;

	/**
	 * Renewal cost
	 * @example "€15.00"
	 */
	renew_cost?: string;

	/**
	 * Renewal raw price
	 * @example 150
	 */
	renew_raw_price?: number;

	/**
	 * Sale cost
	 * @example 10.9
	 */
	sale_cost?: number;

	/**
	 * Whether the domain supports privacy
	 */
	supports_privacy: boolean;

	/**
	 * The domain vendor
	 */
	vendor: string;

	/**
	 * Whether the domain is free.
	 */
	is_free?: true;

	/**
	 * Whether the domain is premium
	 */
	is_premium?: true;

	/**
	 * Whether the client should show the SSL certificate notice
	 */
	hsts_required?: true;

	/**
	 * Whether the client should show the dot gay notice
	 */
	dot_gay_notice_required?: true;
}

export interface FreeDomainSuggestion {
	cost: 'Free';
	domain_name: string;
	is_free: true;
}
