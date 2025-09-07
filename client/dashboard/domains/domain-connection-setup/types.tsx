import {
	DomainConnectionSetupMode,
	DomainMappingSetupInfo,
	DomainMappingStatus,
} from '@automattic/api-core';
import { __ } from '@wordpress/i18n';
import {
	Login,
	SuggestedStart,
	SuggestedRecords,
	AdvancedStart,
	Done,
	AdvancedRecords,
} from './steps';

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

export type StepComponentProps = {
	domainName: string;
	stepType: StepType;
	stepName: StepName;
	mode: DomainConnectionSetupMode | null;
	onNextStep: () => void;
	setPage: ( stepName: StepName ) => void;
	domainSetupInfo: DomainMappingSetupInfo;
	verificationStatus: DomainMappingStatus | undefined;
	onVerifyConnection: () => void;
	verificationInProgress: boolean;
	showErrors: boolean;
	isFirstVisit: boolean;
	queryError: string | null;
	queryErrorDescription: string | null;
	isOwnershipVerificationFlow: boolean;
};

export type StepDefinition = {
	mode: DomainConnectionSetupMode;
	stepType: StepType;
	name?: string;
	component: React.ComponentType< StepComponentProps >;
	next?: StepName;
	prev?: StepName;
	singleColumnLayout?: boolean;
};

export type ProgressStepList = Partial< Record< StepName, string > >;

export type DomainConnectionStepsMap = Partial< Record< StepName, StepDefinition > >;

export const connectADomainDomainConnectionStepsMap: DomainConnectionStepsMap = {
	// Suggested flow
	[ StepName.SUGGESTED_START ]: {
		mode: DomainConnectionSetupMode.SUGGESTED,
		stepType: StepType.START,
		component: SuggestedStart,
		next: StepName.SUGGESTED_LOGIN,
	},
	[ StepName.SUGGESTED_LOGIN ]: {
		mode: DomainConnectionSetupMode.SUGGESTED,
		stepType: StepType.LOG_IN_TO_PROVIDER,
		get name() {
			return __( 'Log in to provider' );
		},
		component: Login,
		next: StepName.SUGGESTED_UPDATE,
		prev: StepName.SUGGESTED_START,
	},
	[ StepName.SUGGESTED_UPDATE ]: {
		mode: DomainConnectionSetupMode.SUGGESTED,
		stepType: StepType.UPDATE_NAME_SERVERS,
		get name() {
			return __( 'Update name servers' );
		},
		component: SuggestedRecords,
		prev: StepName.SUGGESTED_LOGIN,
	},
	[ StepName.SUGGESTED_CONNECTED ]: {
		mode: DomainConnectionSetupMode.SUGGESTED,
		stepType: StepType.CONNECTED,
		component: Done,
		prev: StepName.SUGGESTED_UPDATE,
		singleColumnLayout: true,
	},
	[ StepName.SUGGESTED_VERIFYING ]: {
		mode: DomainConnectionSetupMode.SUGGESTED,
		stepType: StepType.VERIFYING,
		component: Done,
		prev: StepName.SUGGESTED_UPDATE,
		singleColumnLayout: true,
	},

	// Advanced flow
	[ StepName.ADVANCED_START ]: {
		mode: DomainConnectionSetupMode.ADVANCED,
		stepType: StepType.START,
		component: AdvancedStart,
		next: StepName.ADVANCED_LOGIN,
		prev: StepName.SUGGESTED_START,
	},
	[ StepName.ADVANCED_LOGIN ]: {
		mode: DomainConnectionSetupMode.ADVANCED,
		stepType: StepType.LOG_IN_TO_PROVIDER,
		get name() {
			return __( 'Log in to provider' );
		},
		component: Login,
		next: StepName.ADVANCED_UPDATE,
		prev: StepName.ADVANCED_START,
	},
	[ StepName.ADVANCED_UPDATE ]: {
		mode: DomainConnectionSetupMode.ADVANCED,
		stepType: StepType.UPDATE_A_RECORDS,
		get name() {
			return __( 'Update root A records & CNAME record' );
		},
		component: AdvancedRecords,
		prev: StepName.ADVANCED_LOGIN,
	},
	[ StepName.ADVANCED_CONNECTED ]: {
		mode: DomainConnectionSetupMode.ADVANCED,
		stepType: StepType.CONNECTED,
		component: Done,
		prev: StepName.ADVANCED_UPDATE,
		singleColumnLayout: true,
	},
	[ StepName.ADVANCED_VERIFYING ]: {
		mode: DomainConnectionSetupMode.ADVANCED,
		stepType: StepType.VERIFYING,
		component: Done,
		prev: StepName.ADVANCED_UPDATE,
		singleColumnLayout: true,
	},

	// Domain Connect flow
	[ StepName.DC_START ]: {
		mode: DomainConnectionSetupMode.DC,
		stepType: StepType.START,
		component: SuggestedStart, // TODO: change to DCStart
	},
	[ StepName.DC_RETURN ]: {
		mode: DomainConnectionSetupMode.DC,
		stepType: StepType.VERIFYING,
		component: Done,
		prev: StepName.DC_START,
		singleColumnLayout: true,
	},
};

export const connectASubdomainDomainConnectionStepsMap: DomainConnectionStepsMap = {
	// Suggested flow
	[ StepName.SUBDOMAIN_SUGGESTED_START ]: {
		mode: DomainConnectionSetupMode.SUGGESTED,
		stepType: StepType.START,
		component: SuggestedStart,
		next: StepName.SUBDOMAIN_SUGGESTED_LOGIN,
	},
	[ StepName.SUBDOMAIN_SUGGESTED_LOGIN ]: {
		mode: DomainConnectionSetupMode.SUGGESTED,
		stepType: StepType.LOG_IN_TO_PROVIDER,
		get name() {
			return __( 'Log in to provider' );
		},
		component: SuggestedStart,
		next: StepName.SUBDOMAIN_SUGGESTED_UPDATE,
		prev: StepName.SUBDOMAIN_SUGGESTED_START,
	},
	[ StepName.SUBDOMAIN_SUGGESTED_UPDATE ]: {
		mode: DomainConnectionSetupMode.SUGGESTED,
		stepType: StepType.UPDATE_NS_RECORDS,
		get name() {
			return __( 'Update NS records' );
		},
		component: SuggestedStart,
		prev: StepName.SUBDOMAIN_SUGGESTED_LOGIN,
	},
	[ StepName.SUBDOMAIN_SUGGESTED_CONNECTED ]: {
		mode: DomainConnectionSetupMode.SUGGESTED,
		stepType: StepType.CONNECTED,
		component: SuggestedStart,
		prev: StepName.SUBDOMAIN_SUGGESTED_UPDATE,
		singleColumnLayout: true,
	},
	[ StepName.SUBDOMAIN_SUGGESTED_VERIFYING ]: {
		mode: DomainConnectionSetupMode.SUGGESTED,
		stepType: StepType.VERIFYING,
		component: SuggestedStart,
		prev: StepName.SUBDOMAIN_SUGGESTED_UPDATE,
		singleColumnLayout: true,
	},

	// Advanced flow
	[ StepName.SUBDOMAIN_ADVANCED_START ]: {
		mode: DomainConnectionSetupMode.ADVANCED,
		stepType: StepType.START,
		component: AdvancedStart,
		next: StepName.SUBDOMAIN_ADVANCED_LOGIN,
		prev: StepName.SUBDOMAIN_SUGGESTED_START,
	},
	[ StepName.SUBDOMAIN_ADVANCED_LOGIN ]: {
		mode: DomainConnectionSetupMode.ADVANCED,
		stepType: StepType.LOG_IN_TO_PROVIDER,
		get name() {
			return __( 'Log in to provider' );
		},
		component: SuggestedStart,
		next: StepName.SUBDOMAIN_ADVANCED_UPDATE,
		prev: StepName.SUBDOMAIN_ADVANCED_START,
	},
	[ StepName.SUBDOMAIN_ADVANCED_UPDATE ]: {
		mode: DomainConnectionSetupMode.ADVANCED,
		stepType: StepType.UPDATE_CNAME_RECORDS,
		get name() {
			return __( 'Update A & CNAME records' );
		},
		component: SuggestedStart,
		prev: StepName.SUBDOMAIN_ADVANCED_LOGIN,
	},
	[ StepName.SUBDOMAIN_ADVANCED_CONNECTED ]: {
		mode: DomainConnectionSetupMode.ADVANCED,
		stepType: StepType.CONNECTED,
		component: SuggestedStart,
		prev: StepName.SUBDOMAIN_ADVANCED_UPDATE,
		singleColumnLayout: true,
	},
	[ StepName.SUBDOMAIN_ADVANCED_VERIFYING ]: {
		mode: DomainConnectionSetupMode.ADVANCED,
		stepType: StepType.VERIFYING,
		component: SuggestedStart,
		prev: StepName.SUBDOMAIN_ADVANCED_UPDATE,
		singleColumnLayout: true,
	},
};

export type DNSRecord = {
	type: string;
	name: string;
	value: string;
};
