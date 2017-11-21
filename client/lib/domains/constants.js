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
	MAPPABLE: 'mappable',
	UNKNOWN: 'unknown',
	NOT_REGISTRABLE: 'available_but_not_registrable',
	MAINTENANCE: 'tld_in_maintenance',
	PURCHASES_DISABLED: 'domain_registration_unavailable',
	FORBIDDEN: 'forbidden_domain',
	FORBIDDEN_SUBDOMAIN: 'forbidden_subdomain',
	EMPTY_QUERY: 'empty_query',
	INVALID_QUERY: 'invalid_query',
	INVALID: 'invalid_domain',
	INVALID_TLD: 'invalid_tld',
	RESTRICTED: 'restricted_domain',
	BLACKLISTED: 'blacklisted_domain',
	MAPPED: 'mapped_domain',
	RECENTLY_UNMAPPED: 'recently_mapped',
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
