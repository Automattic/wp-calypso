export const type = {
	MAPPED: 'MAPPED',
	REGISTERED: 'REGISTERED',
	SITE_REDIRECT: 'SITE_REDIRECT',
	WPCOM: 'WPCOM',
	TRANSFER: 'TRANSFER',
};

export const transferStatus = {
	PENDING_OWNER: 'PENDING_OWNER',
	PENDING_REGISTRY: 'PENDING_REGISTRY',
	CANCELLED: 'CANCELLED',
	COMPLETED: 'COMPLETED',
	PENDING_START: 'PENDING_START',
	PENDING_ASYNC: 'PENDING_ASYNC',
};

export const registrar = {
	OPENHRS: 'OpenHRS',
	OPENSRS: 'OpenSRS',
	WWD: 'WWD',
	MAINTENANCE: 'Registrar TLD Maintenance',
};

export const domainAvailability = {
	AVAILABLE: 'available',
	AVAILABLE_PREMIUM: 'available_premium',
	AVAILABLE_RESERVED: 'available_reserved',
	AVAILABILITY_CHECK_ERROR: 'availability_check_error',
	CONFLICTING_CNAME_EXISTS: 'conflicting_cname_exists',
	DISALLOWED: 'blacklisted_domain',
	DOMAIN_AVAILABILITY_THROTTLED: 'domain_availability_throttle',
	DOMAIN_SUGGESTIONS_THROTTLED: 'domain_suggestions_throttled',
	DOTBLOG_SUBDOMAIN: 'dotblog_subdomain',
	EMPTY_QUERY: 'empty_query',
	EMPTY_RESULTS: 'empty_results',
	FORBIDDEN: 'forbidden_domain',
	FORBIDDEN_SUBDOMAIN: 'forbidden_subdomain',
	IN_REDEMPTION: 'in_redemption',
	INVALID: 'invalid_domain',
	INVALID_LENGTH: 'invalid_length',
	INVALID_QUERY: 'invalid_query',
	INVALID_TLD: 'invalid_tld',
	MAINTENANCE: 'tld_in_maintenance',
	MAPPABLE: 'mappable',
	MAPPED: 'mapped_domain',
	MAPPED_OTHER_SITE_SAME_USER: 'mapped_to_other_site_same_user',
	MAPPED_OTHER_SITE_SAME_USER_REGISTRABLE: 'mapped_to_other_site_same_user_registrable',
	MAPPED_SAME_SITE_NOT_TRANSFERRABLE: 'mapped_to_same_site_not_transferrable',
	MAPPED_SAME_SITE_TRANSFERRABLE: 'mapped_to_same_site_transferrable',
	MAPPED_SAME_SITE_REGISTRABLE: 'mapped_to_same_site_registrable',
	NOT_AVAILABLE: 'not_available',
	NOT_REGISTRABLE: 'available_but_not_registrable',
	PURCHASES_DISABLED: 'domain_registration_unavailable',
	RECENT_REGISTRATION_LOCK_NOT_TRANSFERRABLE: 'recent_registration_lock_not_transferrable',
	RECENTLY_UNMAPPED: 'recently_mapped',
	RECENTLY_EXPIRED: 'recently_expired',
	REGISTERED: 'registered_domain',
	REGISTERED_OTHER_SITE_SAME_USER: 'registered_on_other_site_same_user',
	REGISTERED_SAME_SITE: 'registered_on_same_site',
	RESTRICTED: 'restricted_domain',
	SERVER_TRANSFER_PROHIBITED_NOT_TRANSFERRABLE: 'server_transfer_prohibited_not_transferrable',
	TLD_NOT_SUPPORTED: 'tld_not_supported',
	TLD_NOT_SUPPORTED_AND_DOMAIN_NOT_AVAILABLE: 'tld_not_supported_and_domain_not_available',
	TLD_NOT_SUPPORTED_TEMPORARILY: 'tld_not_supported_temporarily',
	TRANSFER_PENDING: 'transfer_pending',
	TRANSFER_PENDING_SAME_USER: 'transfer_pending_same_user',
	TRANSFERRABLE: 'transferrable',
	TRANSFERRABLE_PREMIUM: 'transferrable_premium',
	UNKNOWN: 'unknown',
	UNKOWN_ACTIVE: 'unknown_active_domain_with_wpcom',
	WPCOM_STAGING_DOMAIN: 'wpcom_staging_domain',
};

/*
 * Note that GMAIL only sets up email-related records,
 * while G_SUITE also adds a verification record.
 */
export const dnsTemplates = {
	GMAIL: {
		PROVIDER: 'g-suite',
		SERVICE: 'gmail',
	},
	G_SUITE: {
		PROVIDER: 'g-suite',
		SERVICE: 'G-Suite',
	},
	ICLOUD_MAIL: {
		PROVIDER: 'apple-icloud-mail',
		SERVICE: 'icloud-mail',
	},
	MICROSOFT_OFFICE365: {
		PROVIDER: 'microsoft-office365',
		SERVICE: 'O365',
	},
	TITAN: {
		PROVIDER: 'titan-mail',
		SERVICE: 'titan',
	},
	ZOHO_MAIL: {
		PROVIDER: 'zoho-mail',
		SERVICE: 'Zoho',
	},
};

export { domainProductSlugs } from '@automattic/calypso-products';

export const gdprConsentStatus = {
	NONE: 'NONE',
	PENDING: 'PENDING',
	PENDING_ASYNC: 'PENDING_ASYNC',
	ACCEPTED_CONTRACTUAL_MINIMUM: 'ACCEPTED_CONTRACTUAL_MINIMUM',
	ACCEPTED_FULL: 'ACCEPTED_FULL',
	DENIED: 'DENIED',
	FORCED_ALL_CONTRACTUAL: 'FORCED_ALL_CONTRACTUAL',
};

export const domainConnect = {
	DISCOVERY_TXT_RECORD_NAME: '_domainconnect',
	API_URL: 'public-api.wordpress.com/rest/v1.3/domain-connect',
};

export const sslStatuses = {
	SSL_DISABLED: 'disabled',
	SSL_PENDING: 'pending',
	SSL_ACTIVE: 'active',
	SSL_NEWLY_REGISTERED: 'newly_registered',
};

export const domainInfoContext = {
	DOMAIN_ITEM: 'DOMAIN_ITEM',
	DOMAIN_ROW: 'DOMAIN_ROW',
	PAGE_TITLE: 'PAGE_TITLE',
};

export const freeSiteAddressType = {
	MANAGED: 'managed',
	BLOG: 'blog',
};
