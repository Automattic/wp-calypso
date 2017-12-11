/** @format */

/**
 * External dependencies
 */

import keyMirror from 'key-mirror';

const type = keyMirror( {
	MAPPED: null,
	REGISTERED: null,
	SITE_REDIRECT: null,
	WPCOM: null,
	TRANSFER: null,
} );

const transferStatus = keyMirror( {
	PENDING_OWNER: null,
	PENDING_REGISTRY: null,
	CANCELLED: null,
	COMPLETED: null,
} );

const registrar = {
	OPENHRS: 'OpenHRS',
	OPENSRS: 'OpenSRS',
	WWD: 'WWD',
	MAINTENANCE: 'Registrar TLD Maintenance',
};

const domainAvailability = {
	AVAILABLE: 'available',
	BLACKLISTED: 'blacklisted_domain',
	EMPTY_QUERY: 'empty_query',
	FORBIDDEN: 'forbidden_domain',
	FORBIDDEN_SUBDOMAIN: 'forbidden_subdomain',
	INVALID: 'invalid_domain',
	INVALID_QUERY: 'invalid_query',
	INVALID_TLD: 'invalid_tld',
	MAINTENANCE: 'tld_in_maintenance',
	MAPPABLE: 'mappable',
	MAPPED: 'mapped_domain',
	MAPPED_OTHER_SITE_SAME_USER: 'mapped_to_other_site_same_user',
	MAPPED_SAME_SITE_NOT_TRANSFERRABLE: 'mapped_to_same_site_not_transferrable',
	MAPPED_SAME_SITE_TRANSFERRABLE: 'mapped_to_same_site_transferrable',
	NOT_AVAILABLE: 'not_available',
	NOT_REGISTRABLE: 'available_but_not_registrable',
	PURCHASES_DISABLED: 'domain_registration_unavailable',
	RECENTLY_UNMAPPED: 'recently_mapped',
	REGISTERED: 'registered_domain',
	REGISTERED_OTHER_SITE_SAME_USER: 'registered_on_other_site_same_user',
	REGISTERED_SAME_SITE: 'registered_on_same_site',
	RESTRICTED: 'restricted_domain',
	TLD_NOT_SUPPORTED: 'tld_not_supported',
	TRANSFER_PENDING: 'transfer_pending',
	TRANSFER_PENDING_SAME_USER: 'transfer_pending_same_user',
	TRANSFERRABLE: 'transferrable',
	UNKNOWN: 'unknown',
	UNKOWN_ACTIVE: 'unknown_active_domain_with_wpcom',
};

const dnsTemplates = {
	G_SUITE: {
		PROVIDER: 'g-suite',
		SERVICE: 'G-Suite',
	},
	MICROSOFT_OFFICE365: {
		PROVIDER: 'microsoft-office365',
		SERVICE: 'O365',
	},
	ZOHO_MAIL: {
		PROVIDER: 'zoho-mail',
		SERVICE: 'Zoho',
	},
};

const domainProductSlugs = {
	TRANSFER_IN: 'domain_transfer',
	TRANSFER_IN_PRIVACY: 'domain_transfer_privacy',
};

export default {
	dnsTemplates,
	domainAvailability,
	domainProductSlugs,
	registrar,
	transferStatus,
	type,
};
