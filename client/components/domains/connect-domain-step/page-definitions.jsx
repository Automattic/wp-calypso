/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { modeType, stepSlug, stepType } from './constants';
import ConnectDomainStepAdvancedStart from './connect-domain-step-advanced-start';
import ConnectDomainStepAdvancedRecords from './connect-domain-step-advanced-records';
import ConnectDomainStepDone from './connect-domain-step-done';
import ConnectDomainStepLogin from './connect-domain-step-login';
import ConnectDomainStepSuggestedRecords from './connect-domain-step-suggested-records';
import ConnectDomainStepSuggestedStart from './connect-domain-step-suggested-start';

export const defaultStepsDefinition = {
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
		name: __( 'Log in to provider' ),
		component: ConnectDomainStepLogin,
		next: stepSlug.SUGGESTED_UPDATE,
		prev: stepSlug.SUGGESTED_START,
	},
	[ stepSlug.SUGGESTED_UPDATE ]: {
		mode: modeType.SUGGESTED,
		step: stepType.UPDATE_NAME_SERVERS,
		name: __( 'Update name servers' ),
		component: ConnectDomainStepSuggestedRecords,
		prev: stepSlug.SUGGESTED_LOGIN,
	},
	[ stepSlug.SUGGESTED_CONNECTED ]: {
		mode: modeType.SUGGESTED,
		step: stepType.CONNECTED,
		component: ConnectDomainStepDone,
		prev: { [ modeType.ADVANCED ]: stepSlug.SUGGESTED_UPDATE },
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
		name: __( 'Log in to provider' ),
		component: ConnectDomainStepLogin,
		next: stepSlug.ADVANCED_UPDATE,
		prev: stepSlug.ADVANCED_START,
	},
	[ stepSlug.ADVANCED_UPDATE ]: {
		mode: modeType.ADVANCED,
		step: stepType.UPDATE_A_RECORDS,
		name: __( 'Update root A records & CNAME record' ),
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

// eslint-disable-next-line no-unused-vars
export const getStepsDefinition = ( selectedSite, domain, domainSetupInfo ) => {
	// This can be used to determine which steps definition to use based on the inputs.
	return defaultStepsDefinition;
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

	let [ , step ] = Object.entries( modeSteps ).find(
		( [ , pageDefinition ] ) => pageDefinition.step === stepType.START
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
