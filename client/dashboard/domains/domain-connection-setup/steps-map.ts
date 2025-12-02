import { DomainConnectionSetupMode } from '@automattic/api-core';
import { __ } from '@wordpress/i18n';
import {
	AdvancedRecords,
	AdvancedStart,
	DomainConnectStart,
	Done,
	Login,
	SuggestedRecords,
	SuggestedStart,
	TransferStart,
	TransferLogin,
	TransferUnlock,
	TransferAuthCode,
} from './steps';
import { StepName, StepType, DomainConnectionStepsMap, DomainTransferStepsMap } from './types';

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
		component: DomainConnectStart,
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

export const transferLockedDomainStepsDefinition: DomainTransferStepsMap = {
	[ StepName.TRANSFER_START ]: {
		mode: DomainConnectionSetupMode.TRANSFER,
		stepType: StepType.START,
		component: TransferStart,
		next: StepName.TRANSFER_LOGIN,
	},
	[ StepName.TRANSFER_LOGIN ]: {
		mode: DomainConnectionSetupMode.TRANSFER,
		stepType: StepType.LOG_IN_TO_PROVIDER,
		get name() {
			return __( 'Log in to provider' );
		},
		component: TransferLogin,
		next: StepName.TRANSFER_UNLOCK,
		prev: StepName.TRANSFER_START,
	},
	[ StepName.TRANSFER_UNLOCK ]: {
		mode: DomainConnectionSetupMode.TRANSFER,
		stepType: StepType.UNLOCK_DOMAIN,
		get name() {
			return __( 'Unlock domain' );
		},
		component: TransferUnlock,
		next: StepName.TRANSFER_AUTH_CODE,
		prev: StepName.TRANSFER_LOGIN,
	},
	[ StepName.TRANSFER_AUTH_CODE ]: {
		mode: DomainConnectionSetupMode.TRANSFER,
		stepType: StepType.ENTER_AUTH_CODE,
		get name() {
			return __( 'Authorize the transfer' );
		},
		component: TransferAuthCode,
		prev: StepName.TRANSFER_UNLOCK,
	},
	[ StepName.UNUSED_TRANSFER_DOMAIN_STEP ]: {
		mode: DomainConnectionSetupMode.TRANSFER,
		stepType: StepType.FINALIZE,
		component: null,
		get name() {
			return __( 'Finalize transfer' );
		},
	},
};

export const transferUnlockedDomainStepsDefinition: DomainTransferStepsMap = {
	[ StepName.TRANSFER_START ]: {
		mode: DomainConnectionSetupMode.TRANSFER,
		stepType: StepType.START,
		component: TransferStart,
		next: StepName.TRANSFER_LOGIN,
	},
	[ StepName.TRANSFER_LOGIN ]: {
		mode: DomainConnectionSetupMode.TRANSFER,
		stepType: StepType.LOG_IN_TO_PROVIDER,
		get name() {
			return __( 'Log in to provider' );
		},
		component: TransferLogin,
		next: StepName.TRANSFER_AUTH_CODE,
		prev: StepName.TRANSFER_START,
	},
	[ StepName.TRANSFER_AUTH_CODE ]: {
		mode: DomainConnectionSetupMode.TRANSFER,
		stepType: StepType.ENTER_AUTH_CODE,
		get name() {
			return __( 'Authorize the transfer' );
		},
		component: TransferAuthCode,
		prev: StepName.TRANSFER_LOGIN,
	},
	[ StepName.UNUSED_TRANSFER_DOMAIN_STEP ]: {
		mode: DomainConnectionSetupMode.TRANSFER,
		stepType: StepType.FINALIZE,
		component: null,
		get name() {
			return __( 'Finalize transfer' );
		},
	},
};
