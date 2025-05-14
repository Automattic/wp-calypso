import { getFlowFromURL } from 'calypso/landing/stepper/utils/get-flow-from-url';
import { useExperiment, loadExperimentAssignment } from 'calypso/lib/explat';
import { getSignupCompleteFlowName } from 'calypso/signup/storageUtils';

const STREAMLINED_PRICE_EXPERIMENT_NAME = 'calypso_streamlined_plans_checkout';

export function useStreamlinedPriceExperiment(): [ boolean, string | null ] {
	const flowFromStorage = getSignupCompleteFlowName(); // The flow for the Checkout page
	const flowFromURL = getFlowFromURL(); // The flow for the Plans step
	const flow = flowFromStorage || flowFromURL;

	const [ isLoadingExperiment, assignment ] = useExperiment(
		STREAMLINED_PRICE_EXPERIMENT_NAME,
		{ isEligible: flow === 'onboarding' } // Only onboarding flow is eligible for streamlined pricing
	);

	return [ isLoadingExperiment, assignment?.variationName ?? null ];
}

export async function isStreamlinedPriceExperiment() {
	const assignment = await loadExperimentAssignment( STREAMLINED_PRICE_EXPERIMENT_NAME );
	return assignment?.variationName !== null;
}

export function isStreamlinedPricePlansTreatment( variationName?: string | null ) {
	if ( ! variationName ) {
		return false;
	}
	return ! variationName.includes( 'plans_control' );
}

export function isStreamlinedPriceRadioTreatment( variationName?: string | null ) {
	if ( ! variationName ) {
		return false;
	}
	return variationName.includes( 'checkout_radio' );
}
