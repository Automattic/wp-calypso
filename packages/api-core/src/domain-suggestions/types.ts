export type DomainSuggestionQueryVendor =
	| 'variation2_front'
	| 'variation4_front'
	| 'variation8_front'
	| 'ciab'
	| 'newsletter'
	| 'ecommerce'
	| 'gravatar'
	| '100-year-domains'
	| 'domain-upsell'
	| 'wpcom_suggestions_premium'
	| 'wpcom_suggestions_standard';

export interface DomainSuggestionQuery {
	/**
	 * True to only provide exact domain name match suggestions
	 */
	exact_sld_matches_only?: boolean;

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
	vendor: DomainSuggestionQueryVendor;

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

	/**
	 * The site slug
	 */
	site_slug?: string;
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
	match_reasons?: string[];

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

	/**
	 * Policy notices associated with the domain
	 */
	policy_notices?: PolicyNotice[];
}

export interface PolicyNotice {
	type: string;
	label: string;
	message: string;
}

export interface FreeDomainSuggestion {
	cost: 'Free';
	domain_name: string;
	is_free: true;
}

export interface BundleSuggestionDomain {
	/**
	 * The fully-qualified domain name
	 * @example "example.com"
	 */
	domain: string;

	/**
	 * Rendered formatted cost for this domain
	 * @example "$22.00"
	 */
	cost: string;

	/**
	 * Raw numeric price for this domain
	 * @example 22
	 */
	raw_price: number;

	/**
	 * The product slug
	 * @example "domain_reg"
	 */
	product_slug: string;

	/**
	 * Whether this domain is premium
	 */
	is_premium?: boolean;

	/**
	 * Whether this domain supports privacy
	 */
	supports_privacy?: boolean;
}

export interface BundleSuggestion {
	/**
	 * The second-level domain shared by the bundle
	 * @example "example"
	 */
	sld: string;

	/**
	 * The companion domains in the bundle. VARIABLE LENGTH (2, 3, or 4).
	 */
	domains: BundleSuggestionDomain[];

	/**
	 * Total bundle price (raw numeric)
	 * @example 60
	 */
	bundle_price: number;

	/**
	 * Combined original price before bundle discount (raw numeric)
	 * @example 75
	 */
	original_price: number;

	/**
	 * Bundle discount as a whole-number percent
	 * @example 20
	 */
	discount_percent: number;

	/**
	 * Bundle category slug
	 * @example "business"
	 */
	category: string;

	/**
	 * Stable identifier for this specific bundle suggestion
	 */
	bundle_id: string;

	/**
	 * Identifier for the group/experiment the bundle belongs to
	 */
	bundle_group_id: string;

	/**
	 * Catalogue version the bundle was generated against.
	 * (Added in the amended DOMAINS-2166 contract.)
	 */
	catalogue_version: string;
}
