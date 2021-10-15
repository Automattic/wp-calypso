import { __ } from '@wordpress/i18n';
import TransferDomainStepAuthCode from 'calypso/components/domains/connect-domain-step/transfer-domain-step-auth-code';
import TransferDomainStepLogin from 'calypso/components/domains/connect-domain-step/transfer-domain-step-login';
import TransferDomainStepStart from 'calypso/components/domains/connect-domain-step/transfer-domain-step-start';
import TransferDomainStepUnlock from 'calypso/components/domains/connect-domain-step/transfer-domain-step-unlock';
import ConnectDomainStepAdvancedRecords from './connect-domain-step-advanced-records';
import ConnectDomainStepAdvancedStart from './connect-domain-step-advanced-start';
import ConnectDomainStepDone from './connect-domain-step-done';
import ConnectDomainStepLogin from './connect-domain-step-login';
import ConnectDomainStepOwnershipAuthCode from './connect-domain-step-ownership-auth-code';
import ConnectDomainStepSuggestedRecords from './connect-domain-step-suggested-records';
import ConnectDomainStepSuggestedStart from './connect-domain-step-suggested-start';
import { modeType, stepSlug, stepType } from './constants';

const labels = {
	[ stepSlug.SUGGESTED_LOGIN ]: () => __( 'Log in to provider' ),
	[ stepSlug.SUGGESTED_UPDATE ]: () => __( 'Update name servers' ),
	[ stepSlug.ADVANCED_LOGIN ]: () => __( 'Log in to provider' ),
	[ stepSlug.ADVANCED_UPDATE ]: () => __( 'Update root A records & CNAME record' ),
	[ stepSlug.OWNERSHIP_VERIFICATION_LOGIN ]: () => __( 'Log in to provider' ),
	[ stepSlug.OWNERSHIP_VERIFICATION_AUTH_CODE ]: () => __( 'Verify ownership' ),
	[ stepSlug.TRANSFER_LOGIN ]: () => __( 'Log in to provider' ),
	[ stepSlug.TRANSFER_UNLOCK ]: () => __( 'Unlock domain' ),
	[ stepSlug.TRANSFER_AUTH_CODE ]: () => __( 'Authorize the transfer' ),
	[ 'unused transfer domain step' ]: () => __( 'Finalize transfer' ),
};

export const connectADomainStepsDefinition = {
	// Suggested flow
	[ stepSlug.SUGGESTED_START ]: {
		mode: modeType.SUGGESTED,
		step: stepType.START,
		component: ConnectDomainStepSuggestedStart,
		next: stepSlug.SUGGESTED_LOGIN,
	},
	[ stepSlug.SUGGESTED_LOGIN ]: {
		mode: modeType.SUGGESTED,
		step: stepType.LOG_IN_TO_PROVIDER,
		name: labels[ stepSlug.SUGGESTED_LOGIN ](),
		component: ConnectDomainStepLogin,
		next: stepSlug.SUGGESTED_UPDATE,
		prev: stepSlug.SUGGESTED_START,
	},
	[ stepSlug.SUGGESTED_UPDATE ]: {
		mode: modeType.SUGGESTED,
		step: stepType.UPDATE_NAME_SERVERS,
		name: labels[ stepSlug.SUGGESTED_UPDATE ](),
		component: ConnectDomainStepSuggestedRecords,
		prev: stepSlug.SUGGESTED_LOGIN,
	},
	[ stepSlug.SUGGESTED_CONNECTED ]: {
		mode: modeType.SUGGESTED,
		step: stepType.CONNECTED,
		component: ConnectDomainStepDone,
		prev: stepSlug.SUGGESTED_UPDATE,
	},
	[ stepSlug.SUGGESTED_VERIFYING ]: {
		mode: modeType.SUGGESTED,
		step: stepType.VERIFYING,
		component: ConnectDomainStepDone,
		prev: stepSlug.SUGGESTED_UPDATE,
	},

	// Advanced flow
	[ stepSlug.ADVANCED_START ]: {
		mode: modeType.ADVANCED,
		step: stepType.START,
		component: ConnectDomainStepAdvancedStart,
		next: stepSlug.ADVANCED_LOGIN,
		prev: stepSlug.SUGGESTED_START,
	},
	[ stepSlug.ADVANCED_LOGIN ]: {
		mode: modeType.ADVANCED,
		step: stepType.LOG_IN_TO_PROVIDER,
		name: labels[ stepSlug.ADVANCED_LOGIN ](),
		component: ConnectDomainStepLogin,
		next: stepSlug.ADVANCED_UPDATE,
		prev: stepSlug.ADVANCED_START,
	},
	[ stepSlug.ADVANCED_UPDATE ]: {
		mode: modeType.ADVANCED,
		step: stepType.UPDATE_A_RECORDS,
		name: labels[ stepSlug.ADVANCED_UPDATE ](),
		component: ConnectDomainStepAdvancedRecords,
		prev: stepSlug.ADVANCED_LOGIN,
	},
	[ stepSlug.ADVANCED_CONNECTED ]: {
		mode: modeType.ADVANCED,
		step: stepType.CONNECTED,
		component: ConnectDomainStepDone,
		prev: stepSlug.ADVANCED_UPDATE,
	},
	[ stepSlug.ADVANCED_VERIFYING ]: {
		mode: modeType.ADVANCED,
		step: stepType.VERIFYING,
		component: ConnectDomainStepDone,
		prev: stepSlug.ADVANCED_UPDATE,
	},
};

export const connectADomainOwnershipVerificationStepsDefinition = {
	[ 'unused start step' ]: {
		mode: modeType.OWNERSHIP_VERIFICATION,
		step: stepType.START,
		next: stepSlug.OWNERSHIP_VERIFICATION_LOGIN,
	},
	[ stepSlug.OWNERSHIP_VERIFICATION_LOGIN ]: {
		mode: modeType.OWNERSHIP_VERIFICATION,
		step: stepType.LOG_IN_TO_PROVIDER,
		name: labels[ stepSlug.OWNERSHIP_VERIFICATION_LOGIN ](),
		component: ConnectDomainStepLogin,
		next: stepSlug.OWNERSHIP_VERIFICATION_AUTH_CODE,
	},
	[ stepSlug.OWNERSHIP_VERIFICATION_AUTH_CODE ]: {
		mode: modeType.OWNERSHIP_VERIFICATION,
		step: stepType.ENTER_AUTH_CODE,
		name: labels[ stepSlug.OWNERSHIP_VERIFICATION_AUTH_CODE ](),
		component: ConnectDomainStepOwnershipAuthCode,
		prev: stepSlug.OWNERSHIP_VERIFICATION_LOGIN,
	},
};

export const transferLockedDomainStepsDefinition = {
	[ stepSlug.TRANSFER_START ]: {
		mode: modeType.TRANSFER,
		step: stepType.START,
		component: TransferDomainStepStart,
		next: stepSlug.TRANSFER_LOGIN,
	},
	[ stepSlug.TRANSFER_LOGIN ]: {
		mode: modeType.TRANSFER,
		step: stepType.LOG_IN_TO_PROVIDER,
		name: labels[ stepSlug.TRANSFER_LOGIN ](),
		component: TransferDomainStepLogin,
		next: stepSlug.TRANSFER_UNLOCK,
		prev: stepSlug.TRANSFER_START,
	},
	[ stepSlug.TRANSFER_UNLOCK ]: {
		mode: modeType.TRANSFER,
		step: stepType.UNLOCK_DOMAIN,
		name: labels[ stepSlug.TRANSFER_UNLOCK ](),
		component: TransferDomainStepUnlock,
		next: stepSlug.TRANSFER_AUTH_CODE,
		prev: stepSlug.TRANSFER_LOGIN,
	},
	[ stepSlug.TRANSFER_AUTH_CODE ]: {
		mode: modeType.TRANSFER,
		step: stepType.ENTER_AUTH_CODE,
		name: labels[ stepSlug.TRANSFER_AUTH_CODE ](),
		component: TransferDomainStepAuthCode,
		next: 'unused transfer domain step',
		prev: stepSlug.TRANSFER_UNLOCK,
	},
	[ 'unused transfer domain step' ]: {
		mode: modeType.TRANSFER,
		step: stepType.FINALIZE,
		name: labels[ 'unused transfer domain step' ](),
	},
};

export const transferUnlockedDomainStepsDefinition = {
	[ stepSlug.TRANSFER_START ]: {
		mode: modeType.TRANSFER,
		step: stepType.START,
		component: TransferDomainStepStart,
		next: stepSlug.TRANSFER_LOGIN,
	},
	[ stepSlug.TRANSFER_LOGIN ]: {
		mode: modeType.TRANSFER,
		step: stepType.LOG_IN_TO_PROVIDER,
		name: labels[ stepSlug.TRANSFER_LOGIN ](),
		component: TransferDomainStepLogin,
		next: stepSlug.TRANSFER_AUTH_CODE,
		prev: stepSlug.TRANSFER_START,
	},
	[ stepSlug.TRANSFER_AUTH_CODE ]: {
		mode: modeType.TRANSFER,
		step: stepType.ENTER_AUTH_CODE,
		name: labels[ stepSlug.TRANSFER_AUTH_CODE ](),
		component: TransferDomainStepAuthCode,
		next: 'unused transfer domain step',
		prev: stepSlug.TRANSFER_LOGIN,
	},
	[ 'unused transfer domain step' ]: {
		mode: modeType.TRANSFER,
		step: stepType.FINALIZE,
		name: labels[ 'unused transfer domain step' ](),
	},
};

export const getPageSlug = ( mode, step, stepsDefinition ) => {
	const [ pageSlug ] = Object.entries( stepsDefinition ).find( ( [ , pageDefinition ] ) => {
		return pageDefinition.mode === mode && pageDefinition.step === step;
	} );

	return pageSlug;
};

export const getProgressStepList = ( mode, stepsDefinition ) => {
	const modeSteps = Object.fromEntries(
		Object.entries( stepsDefinition ).filter(
			( [ , pageDefinition ] ) => pageDefinition.mode === mode
		)
	);

	let step = Object.values( modeSteps ).find(
		( pageDefinition ) => pageDefinition.step === stepType.START
	);

	const stepList = [];

	while ( step?.next ) {
		const [ nextSlug, nextStep ] = Object.entries( modeSteps ).find(
			( [ slug ] ) => slug === step?.next
		);

		stepList.push( [ nextSlug, nextStep.name ] );

		step = nextStep;
	}

	return Object.fromEntries( stepList );
};

/**
 * Define properties with translatable strings getters.
 */
[
	connectADomainStepsDefinition,
	connectADomainOwnershipVerificationStepsDefinition,
	transferLockedDomainStepsDefinition,
	transferUnlockedDomainStepsDefinition,
].forEach( ( definition ) => {
	Object.keys( definition ).forEach( ( slug ) => {
		if ( labels.hasOwnProperty( slug ) ) {
			const translationGetter = labels[ slug ];

			Object.defineProperties( definition[ slug ], {
				name: {
					get: () => translationGetter(),
				},
			} );
		}
	} );
} );
