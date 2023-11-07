export const STORE_KEY = 'automattic/automated-transfer-eligibility';

/**
 * Maps the constants used in the WordPress.com API with
 * those used inside of Calypso. Somewhat redundant, this
 * provides safety for when the API changes. We need not
 * change the constants in the Calypso side, only here
 * in the code directly dealing with the API.
 */
export const statusMapping = {
	blocked_atomic_transfer: 'BLOCKED_ATOMIC_TRANSFER',
	transfer_already_exists: 'TRANSFER_ALREADY_EXISTS',
	no_business_plan: 'NO_BUSINESS_PLAN',
	no_jetpack_sites: 'NO_JETPACK_SITES',
	no_vip_sites: 'NO_VIP_SITES',
	site_private: 'SITE_PRIVATE',
	site_graylisted: 'SITE_GRAYLISTED',
	non_admin_user: 'NON_ADMIN_USER',
	not_resolving_to_wpcom: 'NOT_RESOLVING_TO_WPCOM',
	no_ssl_certificate: 'NO_SSL_CERTIFICATE',
	email_unverified: 'EMAIL_UNVERIFIED',
	excessive_disk_space: 'EXCESSIVE_DISK_SPACE',
} as const;
