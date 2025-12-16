import { DomainConnectionSetupMode } from '@automattic/api-core';
import { __ } from '@wordpress/i18n';
import { TransferStart, TransferLogin, TransferUnlock, TransferAuthCode } from './steps';
import { StepName, StepType, DomainTransferStepsMap } from './types';

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
