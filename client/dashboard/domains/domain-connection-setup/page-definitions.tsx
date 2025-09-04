import { DomainConnectionSetupMode } from '@automattic/api-core';
import { __ } from '@wordpress/i18n';
import { StepSlug, StepType } from './constants';

export type StepDefinition = {
	mode: DomainConnectionSetupMode;
	step: StepType;
	name?: () => string;
	component: React.ReactNode;
	next?: StepSlug;
	prev?: StepSlug;
	singleColumnLayout?: boolean;
};

export type StepsDefinition = Partial< Record< StepSlug, StepDefinition > >;

// TO DO: Remove partial whenb we have implememted all steps
export const connectADomainStepsDefinition: StepsDefinition = {
	// Suggested flow
	[ StepSlug.SUGGESTED_START ]: {
		mode: DomainConnectionSetupMode.SUGGESTED,
		step: StepType.START,
		component: <>ConnectDomainStepSuggestedStart</>,
		next: StepSlug.SUGGESTED_LOGIN,
	},
	[ StepSlug.SUGGESTED_LOGIN ]: {
		mode: DomainConnectionSetupMode.SUGGESTED,
		step: StepType.LOG_IN_TO_PROVIDER,
		name: () => __( 'Log in to provider' ),
		component: <>ConnectDomainStepLogin</>,
		next: StepSlug.SUGGESTED_UPDATE,
		prev: StepSlug.SUGGESTED_START,
	},
	[ StepSlug.SUGGESTED_UPDATE ]: {
		mode: DomainConnectionSetupMode.SUGGESTED,
		step: StepType.UPDATE_NAME_SERVERS,
		name: () => __( 'Update name servers' ),
		component: <>ConnectDomainStepSuggestedRecords</>,
		prev: StepSlug.SUGGESTED_LOGIN,
	},
	[ StepSlug.SUGGESTED_CONNECTED ]: {
		mode: DomainConnectionSetupMode.SUGGESTED,
		step: StepType.CONNECTED,
		component: <>ConnectDomainStepDone</>,
		prev: StepSlug.SUGGESTED_UPDATE,
		singleColumnLayout: true,
	},
	[ StepSlug.SUGGESTED_VERIFYING ]: {
		mode: DomainConnectionSetupMode.SUGGESTED,
		step: StepType.VERIFYING,
		component: <>ConnectDomainStepDone</>,
		prev: StepSlug.SUGGESTED_UPDATE,
		singleColumnLayout: true,
	},

	// Advanced flow
	[ StepSlug.ADVANCED_START ]: {
		mode: DomainConnectionSetupMode.ADVANCED,
		step: StepType.START,
		component: <>ConnectDomainStepAdvancedStart</>,
		next: StepSlug.ADVANCED_LOGIN,
		prev: StepSlug.SUGGESTED_START,
	},
	[ StepSlug.ADVANCED_LOGIN ]: {
		mode: DomainConnectionSetupMode.ADVANCED,
		step: StepType.LOG_IN_TO_PROVIDER,
		name: () => __( 'Log in to provider' ),
		component: <>ConnectDomainStepLogin</>,
		next: StepSlug.ADVANCED_UPDATE,
		prev: StepSlug.ADVANCED_START,
	},
	[ StepSlug.ADVANCED_UPDATE ]: {
		mode: DomainConnectionSetupMode.ADVANCED,
		step: StepType.UPDATE_A_RECORDS,
		name: () => __( 'Update root A records & CNAME record' ),
		component: <>ConnectDomainStepAdvancedRecords</>,
		prev: StepSlug.ADVANCED_LOGIN,
	},
	[ StepSlug.ADVANCED_CONNECTED ]: {
		mode: DomainConnectionSetupMode.ADVANCED,
		step: StepType.CONNECTED,
		component: <>ConnectDomainStepDone</>,
		prev: StepSlug.ADVANCED_UPDATE,
		singleColumnLayout: true,
	},
	[ StepSlug.ADVANCED_VERIFYING ]: {
		mode: DomainConnectionSetupMode.ADVANCED,
		step: StepType.VERIFYING,
		component: <>ConnectDomainStepDone</>,
		prev: StepSlug.ADVANCED_UPDATE,
		singleColumnLayout: true,
	},

	// Domain Connect flow
	[ StepSlug.DC_START ]: {
		mode: DomainConnectionSetupMode.DC,
		step: StepType.START,
		component: <>ConnectDomainStepDCStart</>,
	},
	[ StepSlug.DC_RETURN ]: {
		mode: DomainConnectionSetupMode.DC,
		step: StepType.VERIFYING,
		component: <>ConnectDomainStepDone</>,
		prev: StepSlug.DC_START,
		singleColumnLayout: true,
	},
};

export const connectASubdomainStepsDefinition: StepsDefinition = {
	// Suggested flow
	[ StepSlug.SUBDOMAIN_SUGGESTED_START ]: {
		mode: DomainConnectionSetupMode.SUGGESTED,
		step: StepType.START,
		component: <>ConnectDomainStepSuggestedStart</>,
		next: StepSlug.SUBDOMAIN_SUGGESTED_LOGIN,
	},
	[ StepSlug.SUBDOMAIN_SUGGESTED_LOGIN ]: {
		mode: DomainConnectionSetupMode.SUGGESTED,
		step: StepType.LOG_IN_TO_PROVIDER,
		name: () => __( 'Log in to provider' ),
		component: <>ConnectDomainStepLogin</>,
		next: StepSlug.SUBDOMAIN_SUGGESTED_UPDATE,
		prev: StepSlug.SUBDOMAIN_SUGGESTED_START,
	},
	[ StepSlug.SUBDOMAIN_SUGGESTED_UPDATE ]: {
		mode: DomainConnectionSetupMode.SUGGESTED,
		step: StepType.UPDATE_NS_RECORDS,
		name: () => __( 'Update NS records' ),
		component: <>ConnectSubdomainStepSuggestedRecords</>,
		prev: StepSlug.SUBDOMAIN_SUGGESTED_LOGIN,
	},
	[ StepSlug.SUBDOMAIN_SUGGESTED_CONNECTED ]: {
		mode: DomainConnectionSetupMode.SUGGESTED,
		step: StepType.CONNECTED,
		component: <>ConnectDomainStepDone</>,
		prev: StepSlug.SUBDOMAIN_SUGGESTED_UPDATE,
		singleColumnLayout: true,
	},
	[ StepSlug.SUBDOMAIN_SUGGESTED_VERIFYING ]: {
		mode: DomainConnectionSetupMode.SUGGESTED,
		step: StepType.VERIFYING,
		component: <>ConnectDomainStepDone</>,
		prev: StepSlug.SUBDOMAIN_SUGGESTED_UPDATE,
		singleColumnLayout: true,
	},

	// Advanced flow
	[ StepSlug.SUBDOMAIN_ADVANCED_START ]: {
		mode: DomainConnectionSetupMode.ADVANCED,
		step: StepType.START,
		component: <>ConnectDomainStepAdvancedStart</>,
		next: StepSlug.SUBDOMAIN_ADVANCED_LOGIN,
		prev: StepSlug.SUBDOMAIN_SUGGESTED_START,
	},
	[ StepSlug.SUBDOMAIN_ADVANCED_LOGIN ]: {
		mode: DomainConnectionSetupMode.ADVANCED,
		step: StepType.LOG_IN_TO_PROVIDER,
		name: () => __( 'Log in to provider' ),
		component: <>ConnectDomainStepLogin</>,
		next: StepSlug.SUBDOMAIN_ADVANCED_UPDATE,
		prev: StepSlug.SUBDOMAIN_ADVANCED_START,
	},
	[ StepSlug.SUBDOMAIN_ADVANCED_UPDATE ]: {
		mode: DomainConnectionSetupMode.ADVANCED,
		step: StepType.UPDATE_CNAME_RECORDS,
		name: () => __( 'Update A & CNAME records' ),
		component: <>ConnectDomainStepAdvancedRecords</>,
		prev: StepSlug.SUBDOMAIN_ADVANCED_LOGIN,
	},
	[ StepSlug.SUBDOMAIN_ADVANCED_CONNECTED ]: {
		mode: DomainConnectionSetupMode.ADVANCED,
		step: StepType.CONNECTED,
		component: <>ConnectDomainStepDone</>,
		prev: StepSlug.SUBDOMAIN_ADVANCED_UPDATE,
		singleColumnLayout: true,
	},
	[ StepSlug.SUBDOMAIN_ADVANCED_VERIFYING ]: {
		mode: DomainConnectionSetupMode.ADVANCED,
		step: StepType.VERIFYING,
		component: <>ConnectDomainStepDone</>,
		prev: StepSlug.SUBDOMAIN_ADVANCED_UPDATE,
		singleColumnLayout: true,
	},
};

export const getStepSlug = (
	mode: DomainConnectionSetupMode,
	step: StepType,
	stepsDefinition: StepsDefinition
) => {
	const matchingEntry = Object.entries( stepsDefinition ).find( ( [ , pageDefinition ] ) => {
		return pageDefinition.mode === mode && pageDefinition.step === step;
	} );
	return matchingEntry?.[ 0 ] as StepSlug | undefined;
};

export const getProgressStepList = (
	mode: DomainConnectionSetupMode,
	stepsDefinition: StepsDefinition
): StepType[] => {
	const progressStepList = Object.entries( stepsDefinition )
		.filter( ( [ , pageDefinition ] ) => {
			return pageDefinition.mode === mode;
		} )
		.map( ( [ , pageDefinition ] ) => pageDefinition.step );
	return progressStepList;
};
