/**
 * Error message the status endpoint returns when the site has no transfer record.
 * Maps to `transferStates.NONE`.
 * Legacy fallback — matching on prose is fragile. The backend is gaining a proper
 * `no_transfer_record` error code; once it has been deployed for a while this message
 * match can be removed (tracked in DOTCOM-18223).
 */
export const NO_TRANSFER_RECORD_ERROR = 'An invalid transfer ID was passed.';

export const NO_TRANSFER_RECORD_ERROR_CODE = 'no_transfer_record';

export const isNoTransferRecordError = ( error: {
	error?: string | null;
	message?: string | null;
} ): boolean =>
	error.error === NO_TRANSFER_RECORD_ERROR_CODE || error.message === NO_TRANSFER_RECORD_ERROR;

export const transferStates = {
	/**
	 * This is when the request to fetch the transfer returns the error `NO_TRANSFER_RECORD_ERROR`.
	 */
	NONE: 'none',
	PENDING: 'pending',
	INQUIRING: 'inquiring',
	PROVISIONED: 'provisioned',
	FAILURE: 'failure',
	START: 'start',
	SETUP: 'setup',
	CONFLICTS: 'conflicts',
	ACTIVE: 'active',
	UPLOADING: 'uploading',
	BACKFILLING: 'backfilling',
	RELOCATING: 'relocating_switcheroo',
	COMPLETE: 'complete',
	COMPLETED: 'completed', // there seems to be two spellings for this state
	NULL: null,
	/**
	 * Similar to 'none' there is no existing transfer, but this is when the site has been already reverted from atomic
	 */
	REVERTED: 'reverted',
	RELOCATING_REVERT: 'relocating_revert',
	ERROR: 'error',
	/**
	 * This is when the request to fetch the transfer status failed with an unknown error
	 */
	REQUEST_FAILURE: 'request_failure',
	/**
	 * Client-only: the status poller hit its deadline while the transfer was still in progress.
	 */
	CLIENT_TIMEOUT: 'client_timeout',
} as const;

export type TransferStates = ( typeof transferStates )[ keyof typeof transferStates ];

export const transferCompleteStates: ReadonlyArray< string | null > = [
	transferStates.COMPLETE,
	transferStates.COMPLETED,
];

export const transferFailureStates: ReadonlyArray< string | null > = [
	transferStates.ERROR,
	transferStates.FAILURE,
	transferStates.CONFLICTS,
	transferStates.REVERTED,
];

export const transferSettledStates: ReadonlyArray< string | null > = [
	...transferCompleteStates,
	...transferFailureStates,
];

export const transferInProgress = [
	transferStates.START,
	transferStates.PENDING,
	transferStates.ACTIVE,
	transferStates.PROVISIONED,
] as const;

export const transferRevertingInProgress = [ transferStates.RELOCATING_REVERT ] as const;

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
	// SITE_NOT_PUBLIC is a client constant set for launched sites that are not public.
	// See: client/my-sites/site-settings/settings-performance/main.jsx
	SITE_NOT_PUBLIC: 'SITE_NOT_PUBLIC',
	SITE_GRAYLISTED: 'SITE_GRAYLISTED',
	NON_ADMIN_USER: 'NON_ADMIN_USER',
	NOT_RESOLVING_TO_WPCOM: 'NOT_RESOLVING_TO_WPCOM',
	NO_SSL_CERTIFICATE: 'NO_SSL_CERTIFICATE',
	EMAIL_UNVERIFIED: 'EMAIL_UNVERIFIED',
	EXCESSIVE_DISK_SPACE: 'EXCESSIVE_DISK_SPACE',
	IS_STAGING_SITE: 'IS_STAGING_SITE',
} as const;

export type EligibilityHold = ( typeof eligibilityHolds )[ keyof typeof eligibilityHolds ];
