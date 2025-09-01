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
	is_supported_premium_domain?: true;

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
