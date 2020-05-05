export const transferStates = {
	PENDING: 'pending',
	INQUIRING: 'inquiring',
	FAILURE: 'failure',
	START: 'start',
	SETUP: 'setup',
	CONFLICTS: 'conflicts',
	ACTIVE: 'active',
	UPLOADING: 'uploading',
	BACKFILLING: 'backfilling',
	COMPLETE: 'complete',
	ERROR: 'error',
};

export const eligibilityHolds = {
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
