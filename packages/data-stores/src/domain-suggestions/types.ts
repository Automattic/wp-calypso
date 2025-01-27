import type { DataStatus } from './constants';

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

export type DomainName = string;

export interface DomainSuggestion {
	/**
	 * The domain name
	 * @example "example.com"
	 */
	domain_name: DomainName;

	/**
	 * Rendered formatted cost
	 * @example "Free" or "€15.00"
	 */
	cost: string;

	/**
	 * Raw price
	 * @example 40
	 */
	raw_price: number;

	/**
	 * Currency code
	 * @example USD
	 */
	currency_code: string;

	/**
	 * Relevance as a percent: 0 <= relevance <= 1
	 * @example 0.9
	 */
	relevance?: number;

	/**
	 * Whether the domain supports privacy
	 */
	supports_privacy?: boolean;

	/**
	 * The domain vendor
	 */
	vendor?: string;

	/**
	 * Reasons for suggestion the domain
	 * @example [ "exact-match" ]
	 */
	match_reasons?: readonly string[];

	/**
	 * The product ID
	 */
	product_id?: number;

	/**
	 * The product slug
	 */
	product_slug?: string;

	/**
	 * Whether the domain is free
	 */
	is_free?: boolean;

	/**
	 * Whether the domain requires HSTS
	 */
	hsts_required?: boolean;

	/**
	 * Whether the domain requires to show the notice for .gay tld
	 */
	is_dot_gay_notice_required?: boolean;

	/**
	 * Whether the domain is unavailable
	 */
	unavailable: boolean;

	isRecommended?: boolean;
	isBestAlternative?: boolean;
	is_premium?: boolean;
}
export interface DomainCategory {
	/**
	 * The domain category title
	 */
	title: string;

	/**
	 * The domain category slug
	 */
	slug: string;

	/**
	 * The domain category tier
	 */
	tier: number | null;
}

export interface DomainAvailability {
	/**
	 * The domain name the availability was checked for.
	 */
	domain_name: string;

	/**
	 * The mappability status of the domain.
	 */
	mappable: string;

	/**
	 * The availability status of the domain.
	 */
	status: string;

	/**
	 * Whether the domain supports privacy.
	 */
	supports_privacy: boolean;

	/**
	 * ID of the product
	 */
	product_id?: number;

	/**
	 * The product slug
	 */
	product_slug?: string;

	/**
	 * Rendered cost with currency
	 * @example "€15.00"
	 */
	cost?: string;

	/**
	 * Vendor
	 */
	vendor?: string;

	/**
	 * Whether the domain requires HSTS
	 */
	hsts_required?: boolean;

	/**
	 * Whether the domain requires to show the notice for .gay tld
	 */
	is_dot_gay_notice_required?: boolean;
}

export type TimestampMS = ReturnType< typeof Date.now >;

export type DomainSuggestions = Record< string, DomainSuggestion[] | undefined >;

export interface DomainSuggestionState {
	/**
	 * The state of the DomainSuggestions e.g. pending, failure etc
	 */
	state: DataStatus;

	/**
	 * Domain suggestion data typically returned from the API
	 */
	data: DomainSuggestions;

	/**
	 * Error message
	 */
	errorMessage: string | null;

	/**
	 * Timestamp from last updated attempt
	 */
	lastUpdated: TimestampMS;

	/**
	 * Pending timestamp
	 */
	pendingSince: TimestampMS | undefined;
}

export type DomainAvailabilities = Record< string, DomainAvailability | undefined >;

export type DomainSuggestionSelectorOptions = Partial< Exclude< DomainSuggestionQuery, 'query' > >;
