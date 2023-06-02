import { StatusMapping } from './types';

export const STORE_KEY = 'automattic/automated-transfer-eligibility';

const eligibilityHolds = {
	BLOCKED_ATOMIC_TRANSFER: 'BLOCKED_ATOMIC_TRANSFER',
	TRANSFER_ALREADY_EXISTS: 'TRANSFER_ALREADY_EXISTS',
	NO_BUSINESS_PLAN: 'NO_BUSINESS_PLAN',
	NO_JETPACK_SITES: 'NO_JETPACK_SITES',
	NO_VIP_SITES: 'NO_VIP_SITES',
	SITE_PRIVATE: 'SITE_PRIVATE',
	// SITE_UNLAUNCHED is a client constant to differentiate between launched private sites, and unlaunched sites.
	// See: client/state/data-layer/wpcom/sites/automated-transfer/eligibility/index.js
	SITE_UNLAUNCHED: 'SITE_UNLAUNCHED',
	SITE_GRAYLISTED: 'SITE_GRAYLISTED',
	NON_ADMIN_USER: 'NON_ADMIN_USER',
	NOT_RESOLVING_TO_WPCOM: 'NOT_RESOLVING_TO_WPCOM',
	NO_SSL_CERTIFICATE: 'NO_SSL_CERTIFICATE',
	EMAIL_UNVERIFIED: 'EMAIL_UNVERIFIED',
	EXCESSIVE_DISK_SPACE: 'EXCESSIVE_DISK_SPACE',
};

/**
 * Maps the constants used in the WordPress.com API with
 * those used inside of Calypso. Somewhat redundant, this
 * provides safety for when the API changes. We need not
 * changes the constants in the Calypso side, only here
 * in the code directly dealing with the API.
 */

export const statusMapping: StatusMapping = {
	blocked_atomic_transfer: eligibilityHolds.BLOCKED_ATOMIC_TRANSFER,
	transfer_already_exists: eligibilityHolds.TRANSFER_ALREADY_EXISTS,
	no_business_plan: eligibilityHolds.NO_BUSINESS_PLAN,
	no_jetpack_sites: eligibilityHolds.NO_JETPACK_SITES,
	no_vip_sites: eligibilityHolds.NO_VIP_SITES,
	site_private: eligibilityHolds.SITE_PRIVATE,
	site_graylisted: eligibilityHolds.SITE_GRAYLISTED,
	non_admin_user: eligibilityHolds.NON_ADMIN_USER,
	not_resolving_to_wpcom: eligibilityHolds.NOT_RESOLVING_TO_WPCOM,
	no_ssl_certificate: eligibilityHolds.NO_SSL_CERTIFICATE,
	email_unverified: eligibilityHolds.EMAIL_UNVERIFIED,
	excessive_disk_space: eligibilityHolds.EXCESSIVE_DISK_SPACE,
};
