import { DomainConnectionSetupMode } from '@automattic/api-core';
import { __ } from '@wordpress/i18n';
import ConnectDomainStepLogin from './steps/step-login';
import ConnectDomainStepSuggestedStart from './steps/suggested-start';

export enum StepType {
	START = 'start_setup',
	LOG_IN_TO_PROVIDER = 'log_in_to_provider',
	UPDATE_NAME_SERVERS = 'update_name_servers',
	UPDATE_A_RECORDS = 'update_a_records',
	UPDATE_NS_RECORDS = 'update_ns_records',
	UPDATE_CNAME_RECORDS = 'update_cname_records',
	CONNECTED = 'connected',
	VERIFYING = 'verifying',
	ENTER_AUTH_CODE = 'enter_auth_code',
	UNLOCK_DOMAIN = 'unlock_domain',
	FINALIZE = 'finalize',
}

export enum StepName {
	SUGGESTED_START = 'suggested_start',
	SUGGESTED_LOGIN = 'suggested_login',
	SUGGESTED_UPDATE = 'suggested_update',
	SUGGESTED_VERIFYING = 'suggested_verifying',
	SUGGESTED_CONNECTED = 'suggested_connected',
	ADVANCED_START = 'advanced_start',
	ADVANCED_LOGIN = 'advanced_login',
	ADVANCED_UPDATE = 'advanced_update',
	ADVANCED_VERIFYING = 'advanced_verifying',
	ADVANCED_CONNECTED = 'advanced_connected',
	DC_START = 'dc_start',
	DC_RETURN = 'dc_return',
	OWNERSHIP_VERIFICATION_LOGIN = 'ownership_verification_login',
	OWNERSHIP_VERIFICATION_AUTH_CODE = 'ownership_verification_auth_code',
	TRANSFER_START = 'transfer_start',
	TRANSFER_LOGIN = 'transfer_login',
	TRANSFER_UNLOCK = 'transfer_unlock',
	TRANSFER_AUTH_CODE = 'transfer_auth_code',
	SUBDOMAIN_SUGGESTED_START = 'subdomain_suggested_start',
	SUBDOMAIN_SUGGESTED_LOGIN = 'subdomain_suggested_login',
	SUBDOMAIN_SUGGESTED_UPDATE = 'subdomain_suggested_update',
	SUBDOMAIN_SUGGESTED_VERIFYING = 'subdomain_suggested_verifying',
	SUBDOMAIN_SUGGESTED_CONNECTED = 'subdomain_suggested_connected',
	SUBDOMAIN_ADVANCED_START = 'subdomain_advanced_start',
	SUBDOMAIN_ADVANCED_LOGIN = 'subdomain_advanced_login',
	SUBDOMAIN_ADVANCED_UPDATE = 'subdomain_advanced_update',
	SUBDOMAIN_ADVANCED_VERIFYING = 'subdomain_advanced_verifying',
	SUBDOMAIN_ADVANCED_CONNECTED = 'subdomain_advanced_connected',
}

export type DomainConnectionStepComponentProps = {
	domainName: string;
	stepName: StepName;
	mode: DomainConnectionSetupMode | null;
	// progressStepList: StepType[];
	onNextStep: () => void;
	setPage: ( stepName: StepName ) => void;
};

export type DomainConnectionStep = {
	mode: DomainConnectionSetupMode;
	step: StepType;
	name?: () => string;
	component: React.ComponentType< DomainConnectionStepComponentProps >;
	next?: StepName;
	prev?: StepName;
	singleColumnLayout?: boolean;
};

export type DomainConnectionStepsMap = Partial< Record< StepName, DomainConnectionStep > >;

export const connectADomainDomainConnectionStepsMap: DomainConnectionStepsMap = {
	// Suggested flow
	[ StepName.SUGGESTED_START ]: {
		mode: DomainConnectionSetupMode.SUGGESTED,
		step: StepType.START,
		component: ConnectDomainStepSuggestedStart,
		next: StepName.SUGGESTED_LOGIN,
	},
	[ StepName.SUGGESTED_LOGIN ]: {
		mode: DomainConnectionSetupMode.SUGGESTED,
		step: StepType.LOG_IN_TO_PROVIDER,
		name: () => __( 'Log in to provider' ),
		component: ConnectDomainStepLogin,
		next: StepName.SUGGESTED_UPDATE,
		prev: StepName.SUGGESTED_START,
	},
	[ StepName.SUGGESTED_UPDATE ]: {
		mode: DomainConnectionSetupMode.SUGGESTED,
		step: StepType.UPDATE_NAME_SERVERS,
		name: () => __( 'Update name servers' ),
		component: ConnectDomainStepSuggestedStart,
		prev: StepName.SUGGESTED_LOGIN,
	},
	[ StepName.SUGGESTED_CONNECTED ]: {
		mode: DomainConnectionSetupMode.SUGGESTED,
		step: StepType.CONNECTED,
		component: ConnectDomainStepSuggestedStart,
		prev: StepName.SUGGESTED_UPDATE,
		singleColumnLayout: true,
	},
	[ StepName.SUGGESTED_VERIFYING ]: {
		mode: DomainConnectionSetupMode.SUGGESTED,
		step: StepType.VERIFYING,
		component: ConnectDomainStepSuggestedStart,
		prev: StepName.SUGGESTED_UPDATE,
		singleColumnLayout: true,
	},

	// Advanced flow
	[ StepName.ADVANCED_START ]: {
		mode: DomainConnectionSetupMode.ADVANCED,
		step: StepType.START,
		component: ConnectDomainStepSuggestedStart,
		next: StepName.ADVANCED_LOGIN,
		prev: StepName.SUGGESTED_START,
	},
	[ StepName.ADVANCED_LOGIN ]: {
		mode: DomainConnectionSetupMode.ADVANCED,
		step: StepType.LOG_IN_TO_PROVIDER,
		name: () => __( 'Log in to provider' ),
		component: ConnectDomainStepSuggestedStart,
		next: StepName.ADVANCED_UPDATE,
		prev: StepName.ADVANCED_START,
	},
	[ StepName.ADVANCED_UPDATE ]: {
		mode: DomainConnectionSetupMode.ADVANCED,
		step: StepType.UPDATE_A_RECORDS,
		name: () => __( 'Update root A records & CNAME record' ),
		component: ConnectDomainStepSuggestedStart,
		prev: StepName.ADVANCED_LOGIN,
	},
	[ StepName.ADVANCED_CONNECTED ]: {
		mode: DomainConnectionSetupMode.ADVANCED,
		step: StepType.CONNECTED,
		component: ConnectDomainStepSuggestedStart,
		prev: StepName.ADVANCED_UPDATE,
		singleColumnLayout: true,
	},
	[ StepName.ADVANCED_VERIFYING ]: {
		mode: DomainConnectionSetupMode.ADVANCED,
		step: StepType.VERIFYING,
		component: ConnectDomainStepSuggestedStart,
		prev: StepName.ADVANCED_UPDATE,
		singleColumnLayout: true,
	},

	// Domain Connect flow
	[ StepName.DC_START ]: {
		mode: DomainConnectionSetupMode.DC,
		step: StepType.START,
		component: ConnectDomainStepSuggestedStart,
	},
	[ StepName.DC_RETURN ]: {
		mode: DomainConnectionSetupMode.DC,
		step: StepType.VERIFYING,
		component: ConnectDomainStepSuggestedStart,
		prev: StepName.DC_START,
		singleColumnLayout: true,
	},
};

export const connectASubdomainDomainConnectionStepsMap: DomainConnectionStepsMap = {
	// Suggested flow
	[ StepName.SUBDOMAIN_SUGGESTED_START ]: {
		mode: DomainConnectionSetupMode.SUGGESTED,
		step: StepType.START,
		component: ConnectDomainStepSuggestedStart,
		next: StepName.SUBDOMAIN_SUGGESTED_LOGIN,
	},
	[ StepName.SUBDOMAIN_SUGGESTED_LOGIN ]: {
		mode: DomainConnectionSetupMode.SUGGESTED,
		step: StepType.LOG_IN_TO_PROVIDER,
		name: () => __( 'Log in to provider' ),
		component: ConnectDomainStepSuggestedStart,
		next: StepName.SUBDOMAIN_SUGGESTED_UPDATE,
		prev: StepName.SUBDOMAIN_SUGGESTED_START,
	},
	[ StepName.SUBDOMAIN_SUGGESTED_UPDATE ]: {
		mode: DomainConnectionSetupMode.SUGGESTED,
		step: StepType.UPDATE_NS_RECORDS,
		name: () => __( 'Update NS records' ),
		component: ConnectDomainStepSuggestedStart,
		prev: StepName.SUBDOMAIN_SUGGESTED_LOGIN,
	},
	[ StepName.SUBDOMAIN_SUGGESTED_CONNECTED ]: {
		mode: DomainConnectionSetupMode.SUGGESTED,
		step: StepType.CONNECTED,
		component: ConnectDomainStepSuggestedStart,
		prev: StepName.SUBDOMAIN_SUGGESTED_UPDATE,
		singleColumnLayout: true,
	},
	[ StepName.SUBDOMAIN_SUGGESTED_VERIFYING ]: {
		mode: DomainConnectionSetupMode.SUGGESTED,
		step: StepType.VERIFYING,
		component: ConnectDomainStepSuggestedStart,
		prev: StepName.SUBDOMAIN_SUGGESTED_UPDATE,
		singleColumnLayout: true,
	},

	// Advanced flow
	[ StepName.SUBDOMAIN_ADVANCED_START ]: {
		mode: DomainConnectionSetupMode.ADVANCED,
		step: StepType.START,
		component: ConnectDomainStepSuggestedStart,
		next: StepName.SUBDOMAIN_ADVANCED_LOGIN,
		prev: StepName.SUBDOMAIN_SUGGESTED_START,
	},
	[ StepName.SUBDOMAIN_ADVANCED_LOGIN ]: {
		mode: DomainConnectionSetupMode.ADVANCED,
		step: StepType.LOG_IN_TO_PROVIDER,
		name: () => __( 'Log in to provider' ),
		component: ConnectDomainStepSuggestedStart,
		next: StepName.SUBDOMAIN_ADVANCED_UPDATE,
		prev: StepName.SUBDOMAIN_ADVANCED_START,
	},
	[ StepName.SUBDOMAIN_ADVANCED_UPDATE ]: {
		mode: DomainConnectionSetupMode.ADVANCED,
		step: StepType.UPDATE_CNAME_RECORDS,
		name: () => __( 'Update A & CNAME records' ),
		component: ConnectDomainStepSuggestedStart,
		prev: StepName.SUBDOMAIN_ADVANCED_LOGIN,
	},
	[ StepName.SUBDOMAIN_ADVANCED_CONNECTED ]: {
		mode: DomainConnectionSetupMode.ADVANCED,
		step: StepType.CONNECTED,
		component: ConnectDomainStepSuggestedStart,
		prev: StepName.SUBDOMAIN_ADVANCED_UPDATE,
		singleColumnLayout: true,
	},
	[ StepName.SUBDOMAIN_ADVANCED_VERIFYING ]: {
		mode: DomainConnectionSetupMode.ADVANCED,
		step: StepType.VERIFYING,
		component: ConnectDomainStepSuggestedStart,
		prev: StepName.SUBDOMAIN_ADVANCED_UPDATE,
		singleColumnLayout: true,
	},
};
