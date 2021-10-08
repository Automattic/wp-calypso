import { __ } from '@wordpress/i18n';

export const modeType = {
	SUGGESTED: 'suggested',
	ADVANCED: 'advanced',
	DONE: 'done',
	OWNERSHIP_VERIFICATION: 'ownership_verification',
	TRANSFER: 'transfer',
} as const;

export const stepType = {
	START: 'start_setup',
	LOG_IN_TO_PROVIDER: 'log_in_to_provider',
	UPDATE_NAME_SERVERS: 'update_name_servers',
	UPDATE_A_RECORDS: 'update_a_records',
	CONNECTED: 'connected',
	VERIFYING: 'verifying',
	ENTER_AUTH_CODE: 'enter_auth_code',
	UNLOCK_DOMAIN: 'unlock_domain',
	FINALIZE: 'finalize',
} as const;

export const stepSlug = {
	SUGGESTED_START: 'suggested_start',
	SUGGESTED_LOGIN: 'suggested_login',
	SUGGESTED_UPDATE: 'suggested_update',
	SUGGESTED_VERIFYING: 'suggested_verifying',
	SUGGESTED_CONNECTED: 'suggested_connected',
	ADVANCED_START: 'advanced_start',
	ADVANCED_LOGIN: 'advanced_login',
	ADVANCED_UPDATE: 'advanced_update',
	ADVANCED_VERIFYING: 'advanced_verifying',
	ADVANCED_CONNECTED: 'advanced_connected',
	OWNERSHIP_VERIFICATION_LOGIN: 'ownership_verification_login',
	OWNERSHIP_VERIFICATION_AUTH_CODE: 'ownership_verification_auth_code',
	TRANSFER_START: 'transfer_start',
	TRANSFER_LOGIN: 'transfer_login',
	TRANSFER_UNLOCK: 'transfer_unlock',
	TRANSFER_AUTH_CODE: 'transfer_auth_code',
} as const;

export const defaultDomainSetupInfo = {
	data: {
		default_ip_addresses: [ '192.0.78.24', '192.0.78.25' ],
		wpcom_name_servers: [ 'ns1.wordpress.com', 'ns2.wordpress.com', 'ns3.wordpress.com' ],
	},
} as const;

export const domainLockStatusType = {
	LOCKED: 'locked',
	UNLOCKED: 'unlocked',
	UNKNOWN: 'unknown',
} as const;

export const stepsHeadingSuggested = __( 'Suggested setup' );
export const stepsHeadingAdvanced = __( 'Advanced setup' );
export const stepsHeadingOwnershipVerification = __( 'Verify domain ownership' );
export const stepsHeadingTransfer = __( 'Initial setup' );

export const authCodeStepDefaultDescription = __(
	'A domain authorization code is a unique code linked only to your domain, it might also be called a secret code, auth code, or EPP code. You can usually find this in your domain settings page.'
);

export const useMyDomainInputMode = {
	domainInput: 'domain-input',
	transferOrConnect: 'transfer-or-connect',
	ownershipVerification: 'ownership-verification',
	transferDomain: 'transfer-domain',
} as const;

export const transferDomainError = {
	AUTH_CODE: __( 'Invalid auth code. Please check the specified code and try again.' ),
	NO_SELECTED_SITE: __( 'Please specify a site.' ),
	GENERIC_ERROR: __( 'We were unable to start the transfer.' ),
};
