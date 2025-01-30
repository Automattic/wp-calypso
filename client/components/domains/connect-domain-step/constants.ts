import { __ } from '@wordpress/i18n';

export const modeType = {
	SUGGESTED: 'suggested',
	ADVANCED: 'advanced',
	DC: 'dc',
	DONE: 'done',
	OWNERSHIP_VERIFICATION: 'ownership_verification',
	TRANSFER: 'transfer',
} as const;

export const stepType = {
	START: 'start_setup',
	LOG_IN_TO_PROVIDER: 'log_in_to_provider',
	UPDATE_NAME_SERVERS: 'update_name_servers',
	UPDATE_A_RECORDS: 'update_a_records',
	UPDATE_NS_RECORDS: 'update_ns_records',
	UPDATE_CNAME_RECORDS: 'update_cname_records',
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
	DC_START: 'dc_start',
	DC_RETURN: 'dc_return',
	OWNERSHIP_VERIFICATION_LOGIN: 'ownership_verification_login',
	OWNERSHIP_VERIFICATION_AUTH_CODE: 'ownership_verification_auth_code',
	TRANSFER_START: 'transfer_start',
	TRANSFER_LOGIN: 'transfer_login',
	TRANSFER_UNLOCK: 'transfer_unlock',
	TRANSFER_AUTH_CODE: 'transfer_auth_code',
	SUBDOMAIN_SUGGESTED_START: 'subdomain_suggested_start',
	SUBDOMAIN_SUGGESTED_LOGIN: 'subdomain_suggested_login',
	SUBDOMAIN_SUGGESTED_UPDATE: 'subdomain_suggested_update',
	SUBDOMAIN_SUGGESTED_VERIFYING: 'subdomain_suggested_verifying',
	SUBDOMAIN_SUGGESTED_CONNECTED: 'subdomain_suggested_connected',
	SUBDOMAIN_ADVANCED_START: 'subdomain_advanced_start',
	SUBDOMAIN_ADVANCED_LOGIN: 'subdomain_advanced_login',
	SUBDOMAIN_ADVANCED_UPDATE: 'subdomain_advanced_update',
	SUBDOMAIN_ADVANCED_VERIFYING: 'subdomain_advanced_verifying',
	SUBDOMAIN_ADVANCED_CONNECTED: 'subdomain_advanced_connected',
} as const;

export const defaultDomainSetupInfo = {
	data: {
		default_ip_addresses: [ '192.0.78.24', '192.0.78.25' ],
		wpcom_name_servers: [ 'ns1.wordpress.com', 'ns2.wordpress.com', 'ns3.wordpress.com' ],
		is_subdomain: false,
	},
} as const;

export const domainLockStatusType = {
	LOCKED: 'locked',
	UNLOCKED: 'unlocked',
	UNKNOWN: 'unknown',
} as const;

export const domainMappingInstructionsMode = {
	[ modeType.SUGGESTED ]: stepSlug.SUGGESTED_UPDATE,
	[ modeType.ADVANCED ]: stepSlug.ADVANCED_UPDATE,
} as const;

export const subdomainMappingInstructionsMode = {
	[ modeType.SUGGESTED ]: stepSlug.SUBDOMAIN_SUGGESTED_UPDATE,
	[ modeType.ADVANCED ]: stepSlug.SUBDOMAIN_ADVANCED_UPDATE,
} as const;

export const stepsHeading = {
	get SUGGESTED() {
		return __( 'Suggested setup' );
	},
	get ADVANCED() {
		return __( 'Advanced setup' );
	},
	get OWNERSHIP_VERIFICATION() {
		return __( 'Verify domain ownership' );
	},
	get TRANSFER() {
		return __( 'Initial setup' );
	},
} as const;

export const authCodeStepDefaultDescription = {
	get label() {
		return __(
			'A domain authorization code is a unique code linked only to your domain, it might also be called a secret code, auth code, or EPP code. You can usually find this in your domain settings page.'
		);
	},
} as const;

export const useMyDomainInputMode = {
	domainInput: 'domain-input',
	transferOrConnect: 'transfer-or-connect',
	ownershipVerification: 'ownership-verification',
	transferDomain: 'transfer-domain',
	startPendingTransfer: 'start-pending-transfer',
} as const;

export const transferDomainError = {
	get AUTH_CODE() {
		return __( 'Invalid auth code. Please check the specified code and try again.' );
	},
	get NO_SELECTED_SITE() {
		return __( 'Please specify a site.' );
	},
	get GENERIC_ERROR() {
		return __( 'We were unable to start the transfer.' );
	},
} as const;
