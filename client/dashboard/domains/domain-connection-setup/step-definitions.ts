import { __ } from '@wordpress/i18n';
import { modeType, stepSlug, stepType } from './constants';
import AdvancedRecords from './steps/advanced-records';
import AdvancedStart from './steps/advanced-start';
import DomainConnectStart from './steps/dc-start';
import Done from './steps/done';
import Login from './steps/login';
import SuggestedRecords from './steps/suggested-records';
import SuggestedStart from './steps/suggested-start';
import type { StepsDefinition, ProgressStepList } from './types';

export const connectADomainStepsDefinition: StepsDefinition = {
	// Suggested flow
	[ stepSlug.SUGGESTED_START ]: {
		mode: modeType.SUGGESTED,
		step: stepType.START,
		component: SuggestedStart,
		next: stepSlug.SUGGESTED_LOGIN,
	},
	[ stepSlug.SUGGESTED_LOGIN ]: {
		mode: modeType.SUGGESTED,
		step: stepType.LOG_IN_TO_PROVIDER,
		name: () => __( 'Log in to provider' ),
		component: Login,
		next: stepSlug.SUGGESTED_UPDATE,
		prev: stepSlug.SUGGESTED_START,
	},
	[ stepSlug.SUGGESTED_UPDATE ]: {
		mode: modeType.SUGGESTED,
		step: stepType.UPDATE_NAME_SERVERS,
		name: () => __( 'Update name servers' ),
		component: SuggestedRecords,
		prev: stepSlug.SUGGESTED_LOGIN,
	},
	[ stepSlug.SUGGESTED_CONNECTED ]: {
		mode: modeType.SUGGESTED,
		step: stepType.CONNECTED,
		component: Done,
		prev: stepSlug.SUGGESTED_UPDATE,
		singleColumnLayout: true,
	},
	[ stepSlug.SUGGESTED_VERIFYING ]: {
		mode: modeType.SUGGESTED,
		step: stepType.VERIFYING,
		component: Done,
		prev: stepSlug.SUGGESTED_UPDATE,
		singleColumnLayout: true,
	},

	// Advanced flow
	[ stepSlug.ADVANCED_START ]: {
		mode: modeType.ADVANCED,
		step: stepType.START,
		component: AdvancedStart,
		next: stepSlug.ADVANCED_LOGIN,
		prev: stepSlug.SUGGESTED_START,
	},
	[ stepSlug.ADVANCED_LOGIN ]: {
		mode: modeType.ADVANCED,
		step: stepType.LOG_IN_TO_PROVIDER,
		name: () => __( 'Log in to provider' ),
		component: Login,
		next: stepSlug.ADVANCED_UPDATE,
		prev: stepSlug.ADVANCED_START,
	},
	[ stepSlug.ADVANCED_UPDATE ]: {
		mode: modeType.ADVANCED,
		step: stepType.UPDATE_A_RECORDS,
		name: () => __( 'Update root A records & CNAME record' ),
		component: AdvancedRecords,
		prev: stepSlug.ADVANCED_LOGIN,
	},
	[ stepSlug.ADVANCED_CONNECTED ]: {
		mode: modeType.ADVANCED,
		step: stepType.CONNECTED,
		component: Done,
		prev: stepSlug.ADVANCED_UPDATE,
		singleColumnLayout: true,
	},
	[ stepSlug.ADVANCED_VERIFYING ]: {
		mode: modeType.ADVANCED,
		step: stepType.VERIFYING,
		component: Done,
		prev: stepSlug.ADVANCED_UPDATE,
		singleColumnLayout: true,
	},

	// Domain Connect flow
	[ stepSlug.DC_START ]: {
		mode: modeType.DC,
		step: stepType.START,
		component: DomainConnectStart,
	},
	[ stepSlug.DC_RETURN ]: {
		mode: modeType.DC,
		step: stepType.VERIFYING,
		component: Done,
		prev: stepSlug.DC_START,
		singleColumnLayout: true,
	},
};

export const connectASubdomainStepsDefinition: StepsDefinition = {
	// Suggested flow
	[ stepSlug.SUBDOMAIN_SUGGESTED_START ]: {
		mode: modeType.SUGGESTED,
		step: stepType.START,
		component: SuggestedStart,
		next: stepSlug.SUBDOMAIN_SUGGESTED_LOGIN,
	},
	[ stepSlug.SUBDOMAIN_SUGGESTED_LOGIN ]: {
		mode: modeType.SUGGESTED,
		step: stepType.LOG_IN_TO_PROVIDER,
		name: () => __( 'Log in to provider' ),
		component: Login,
		next: stepSlug.SUBDOMAIN_SUGGESTED_UPDATE,
		prev: stepSlug.SUBDOMAIN_SUGGESTED_START,
	},
	[ stepSlug.SUBDOMAIN_SUGGESTED_UPDATE ]: {
		mode: modeType.SUGGESTED,
		step: stepType.UPDATE_NS_RECORDS,
		name: () => __( 'Update NS records' ),
		component: SuggestedRecords,
		prev: stepSlug.SUBDOMAIN_SUGGESTED_LOGIN,
	},
	[ stepSlug.SUBDOMAIN_SUGGESTED_CONNECTED ]: {
		mode: modeType.SUGGESTED,
		step: stepType.CONNECTED,
		component: Done,
		prev: stepSlug.SUBDOMAIN_SUGGESTED_UPDATE,
		singleColumnLayout: true,
	},
	[ stepSlug.SUBDOMAIN_SUGGESTED_VERIFYING ]: {
		mode: modeType.SUGGESTED,
		step: stepType.VERIFYING,
		component: Done,
		prev: stepSlug.SUBDOMAIN_SUGGESTED_UPDATE,
		singleColumnLayout: true,
	},

	// Advanced flow
	[ stepSlug.SUBDOMAIN_ADVANCED_START ]: {
		mode: modeType.ADVANCED,
		step: stepType.START,
		component: AdvancedStart,
		next: stepSlug.SUBDOMAIN_ADVANCED_LOGIN,
		prev: stepSlug.SUBDOMAIN_SUGGESTED_START,
	},
	[ stepSlug.SUBDOMAIN_ADVANCED_LOGIN ]: {
		mode: modeType.ADVANCED,
		step: stepType.LOG_IN_TO_PROVIDER,
		name: () => __( 'Log in to provider' ),
		component: Login,
		next: stepSlug.SUBDOMAIN_ADVANCED_UPDATE,
		prev: stepSlug.SUBDOMAIN_ADVANCED_START,
	},
	[ stepSlug.SUBDOMAIN_ADVANCED_UPDATE ]: {
		mode: modeType.ADVANCED,
		step: stepType.UPDATE_CNAME_RECORDS,
		name: () => __( 'Update A & CNAME records' ),
		component: AdvancedRecords,
		prev: stepSlug.SUBDOMAIN_ADVANCED_LOGIN,
	},
	[ stepSlug.SUBDOMAIN_ADVANCED_CONNECTED ]: {
		mode: modeType.ADVANCED,
		step: stepType.CONNECTED,
		component: Done,
		prev: stepSlug.SUBDOMAIN_ADVANCED_UPDATE,
		singleColumnLayout: true,
	},
	[ stepSlug.SUBDOMAIN_ADVANCED_VERIFYING ]: {
		mode: modeType.ADVANCED,
		step: stepType.VERIFYING,
		component: Done,
		prev: stepSlug.SUBDOMAIN_ADVANCED_UPDATE,
		singleColumnLayout: true,
	},
};

export function getPageSlug(
	mode: string,
	step: string,
	stepsDefinition: StepsDefinition
): string | undefined {
	const [ pageSlug ] =
		Object.entries( stepsDefinition ).find( ( [ , pageDefinition ] ) => {
			return pageDefinition.mode === mode && pageDefinition.step === step;
		} ) || [];

	return pageSlug;
}

export function getProgressStepList(
	mode: string,
	stepsDefinition: StepsDefinition
): ProgressStepList {
	const modeSteps = Object.fromEntries(
		Object.entries( stepsDefinition ).filter(
			( [ , pageDefinition ] ) => pageDefinition.mode === mode
		)
	);

	let step = Object.values( modeSteps ).find(
		( pageDefinition ) => pageDefinition.step === stepType.START
	);

	const stepList: Array< [ string, string ] > = [];

	while ( step?.next ) {
		const [ nextSlug, nextStep ] =
			Object.entries( modeSteps ).find( ( [ slug ] ) => slug === step?.next ) || [];

		if ( nextSlug && nextStep?.name ) {
			stepList.push( [ nextSlug, nextStep.name() ] );
		}

		step = nextStep;
	}

	return Object.fromEntries( stepList );
}
