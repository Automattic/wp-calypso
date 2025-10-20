export interface DomainAvailabilityQuery {
	blog_id?: number;
	is_cart_pre_check?: boolean;
	vendor?: string;
}

export interface DomainAvailability {
	/**
	 * The domain name
	 * @example "example.com"
	 */
	domain_name: string;

	/**
	 * The top level domain
	 * @example "com"
	 */
	tld: string;

	/**
	 * Domain availability status
	 */
	status: DomainAvailabilityStatus;

	/**
	 * Whether the domain is a supported premium domain
	 */
	is_supported_premium_domain?: boolean;

	/**
	 * Whether the domain price exceeds the limit
	 */
	is_price_limit_exceeded?: true;

	/**
	 * Domain mappability status
	 */
	mappable: string;

	/**
	 * Whether the domain supports privacy
	 */
	supports_privacy: boolean;

	/**
	 * The domain provider
	 */
	root_domain_provider: string;

	/**
	 * Whether the client should show the SSL certificate notice
	 */
	hsts_required?: true;

	/**
	 * Whether the client should show the dot gay notice
	 */
	dot_gay_notice_required?: true;

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
	 * Renewal cost
	 * @example "€15.00"
	 */
	renew_cost?: string;

	/**
	 * Sale cost
	 * @example 10.9
	 */
	sale_cost?: number;

	/**
	 * Maintenance end time, as a UNIX timestamp in seconds
	 * @example "1714857600"
	 */
	maintenance_end_time?: string;

	/**
	 * Primary domain of other site
	 * @example "example.com"
	 */
	other_site_domain?: string;

	/**
	 * Whether the other_site_domain is a domain-only site
	 * @example true
	 */
	other_site_domain_only?: boolean;

	/**
	 * Whether the domain cannot be transferred to WordPress.com
	 * @example true
	 */
	cannot_transfer_to_wordpress_com?: boolean;

	/**
	 * Whether the domain cannot be transferred to WordPress.com due to unsupported premium TLD
	 * @example true
	 */
	cannot_transfer_due_to_unsupported_premium_tld?: boolean;

	/**
	 * Trademark claims notice info
	 */
	trademark_claims_notice_info?: TrademarkClaimsNoticeInfo;

	/**
	 * Domain product ID, returned when the domain is available for registration
	 */
	product_id?: number;

	/**
	 * Product slug, returned when the domain is available for registration
	 */
	product_slug?: string;

	/**
	 * Raw price of the domain, returned when the domain is available for registration
	 */
	raw_price?: number;

	/**
	 * Search provider vendor, it's value is `availability` when the domain is available for registration
	 */
	vendor?: string;

	/**
	 * This is a domain suggestion property, but availability checks return it when the domain is available for registration
	 * @example [ "exact-match", "tld-exact" ]
	 */
	match_reasons?: string[];
}

export enum DomainAvailabilityStatus {
	AVAILABLE = 'available',
	AVAILABLE_PREMIUM = 'available_premium',
	AVAILABLE_RESERVED = 'available_reserved',
	AVAILABILITY_CHECK_ERROR = 'availability_check_error',
	CONFLICTING_CNAME_EXISTS = 'conflicting_cname_exists',
	DISALLOWED = 'blacklisted_domain',
	DOMAIN_AVAILABILITY_THROTTLED = 'domain_availability_throttle',
	DOMAIN_SUGGESTIONS_THROTTLED = 'domain_suggestions_throttled',
	DOTBLOG_SUBDOMAIN = 'dotblog_subdomain',
	EMPTY_QUERY = 'empty_query',
	EMPTY_RESULTS = 'empty_results',
	FORBIDDEN = 'forbidden_domain',
	FORBIDDEN_SUBDOMAIN = 'forbidden_subdomain',
	IN_REDEMPTION = 'in_redemption',
	INVALID = 'invalid_domain',
	INVALID_LENGTH = 'invalid_length',
	INVALID_QUERY = 'invalid_query',
	INVALID_TLD = 'invalid_tld',
	MAINTENANCE = 'tld_in_maintenance',
	MAPPABLE = 'mappable',
	MAPPED = 'mapped_domain',
	MAPPED_OTHER_SITE_SAME_USER = 'mapped_to_other_site_same_user',
	MAPPED_OTHER_SITE_SAME_USER_REGISTRABLE = 'mapped_to_other_site_same_user_registrable',
	MAPPED_SAME_SITE_NOT_TRANSFERRABLE = 'mapped_to_same_site_not_transferrable',
	MAPPED_SAME_SITE_TRANSFERRABLE = 'mapped_to_same_site_transferrable',
	MAPPED_SAME_SITE_REGISTRABLE = 'mapped_to_same_site_registrable',
	NOT_AVAILABLE = 'not_available',
	NOT_REGISTRABLE = 'available_but_not_registrable',
	PURCHASES_DISABLED = 'domain_registration_unavailable',
	RECENT_REGISTRATION_LOCK_NOT_TRANSFERRABLE = 'recent_registration_lock_not_transferrable',
	RECENTLY_UNMAPPED = 'recently_mapped',
	RECENTLY_EXPIRED = 'recently_expired',
	REGISTERED = 'registered_domain',
	REGISTERED_OTHER_SITE_SAME_USER = 'registered_on_other_site_same_user',
	REGISTERED_SAME_SITE = 'registered_on_same_site',
	RESTRICTED = 'restricted_domain',
	SERVER_TRANSFER_PROHIBITED_NOT_TRANSFERRABLE = 'server_transfer_prohibited_not_transferrable',
	TLD_NOT_SUPPORTED = 'tld_not_supported',
	TLD_NOT_SUPPORTED_AND_DOMAIN_NOT_AVAILABLE = 'tld_not_supported_and_domain_not_available',
	TLD_NOT_SUPPORTED_TEMPORARILY = 'tld_not_supported_temporarily',
	TRANSFER_PENDING = 'transfer_pending',
	TRANSFER_PENDING_SAME_USER = 'transfer_pending_same_user',
	TRANSFERRABLE = 'transferrable',
	TRANSFERRABLE_PREMIUM = 'transferrable_premium',
	UNKNOWN = 'unknown',
	UNKOWN_ACTIVE = 'unknown_active_domain_with_wpcom',
	WPCOM_STAGING_DOMAIN = 'wpcom_staging_domain',
}

export interface TrademarkClaimsNoticeInfo {
	claim: TrademarkClaim | TrademarkClaim[];
}

export interface TrademarkClaimContact {
	name?: string;
	org?: string;
	voice?: string;
	fax?: string;
	email?: string;
	addr?: {
		street?: string[];
		city?: string;
		sp?: string;
		pc?: string;
		cc?: string;
	};
}

export interface TrademarkClaimCourtCase {
	refNum: string;
	cc: string;
	courtName: string;
}

export interface TrademarkClaimUdrpCase {
	caseNo: string;
	udrpProvider: string;
}

export interface TrademarkClaim {
	markName?: string;
	jurDesc?: string;
	goodsAndServices?: string[];
	classDesc?: string[];
	holder?: TrademarkClaimContact;
	contact?: TrademarkClaimContact;
	notExactMatch?: {
		court?: TrademarkClaimCourtCase[];
		udrp?: TrademarkClaimUdrpCase[];
	};
}
