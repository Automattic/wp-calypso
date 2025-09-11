import {
	type DomainConnectionSetupModeValue,
	DomainMappingSetupInfo,
	DomainMappingStatus,
} from '@automattic/api-core';

export const StepType = {
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

export const StepName = {
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

export type StepTypeValue = ( typeof StepType )[ keyof typeof StepType ];
export type StepNameValue = ( typeof StepName )[ keyof typeof StepName ];

export type StepComponentProps = {
	domainName: string;
	stepType: StepTypeValue;
	stepName: StepNameValue;
	mode: DomainConnectionSetupModeValue | null;
	onNextStep: () => void;
	setPage: ( stepName: StepNameValue ) => void;
	domainSetupInfo: DomainMappingSetupInfo;
	verificationStatus: DomainMappingStatus | undefined;
	onVerifyConnection: ( setStepAfterVerify: boolean ) => void;
	verificationInProgress: boolean;
	showErrors: boolean;
	isFirstVisit: boolean;
	queryError: string | null;
	queryErrorDescription: string | null;
	isOwnershipVerificationFlow: boolean;
};

export type StepDefinition = {
	name?: string;
	component: React.ComponentType< StepComponentProps >;
	mode: DomainConnectionSetupModeValue;
	stepType: StepTypeValue;
	next?: StepNameValue;
	prev?: StepNameValue;
	singleColumnLayout?: boolean;
};

export type ProgressStepList = Partial< Record< StepNameValue, string > >;

export type DomainConnectionStepsMap = Partial< Record< StepNameValue, StepDefinition > >;

export type DNSRecord = {
	type: string;
	name: string;
	value: string;
};
