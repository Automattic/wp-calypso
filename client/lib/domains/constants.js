/** @format */

/**
 * External dependencies
 */

import keyMirror from 'key-mirror';

export const type = keyMirror( {
	MAPPED: null,
	REGISTERED: null,
	SITE_REDIRECT: null,
	WPCOM: null,
	TRANSFER: null,
} );

export const transferStatus = keyMirror( {
	PENDING_OWNER: null,
	PENDING_REGISTRY: null,
	CANCELLED: null,
	COMPLETED: null,
} );

export const registrar = {
	OPENHRS: 'OpenHRS',
	OPENSRS: 'OpenSRS',
	WWD: 'WWD',
	MAINTENANCE: 'Registrar TLD Maintenance',
};

export const domainAvailability = {
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

export const dnsTemplates = {
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

export const domainProductSlugs = {
	TRANSFER_IN: 'domain_transfer',
};

const exported = {
	dnsTemplates,
	domainAvailability,
	domainProductSlugs,
	registrar,
	transferStatus,
	type,
};

export default exported;
