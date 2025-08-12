import { getFlowFromURL } from 'calypso/landing/stepper/utils/get-flow-from-url';
import isAkismetCheckout from 'calypso/lib/akismet/is-akismet-checkout';
import { useExperiment, loadExperimentAssignment } from 'calypso/lib/explat';
import isJetpackCheckout from 'calypso/lib/jetpack/is-jetpack-checkout';
import { getSignupCompleteFlowName } from 'calypso/signup/storageUtils';

const STREAMLINED_PRICE_EXPERIMENT_NAME = 'calypso_streamlined_plans_checkout';

export function useStreamlinedPriceExperiment(): [ boolean, string | null ] {
	const [ isLoadingExperiment, assignment ] = useExperiment( STREAMLINED_PRICE_EXPERIMENT_NAME, {
		isEligible: isEligibleForExperiment(),
	} );

	return [ isLoadingExperiment, assignment?.variationName ?? null ];
}

function isEligibleForExperiment(): boolean {
	const flowFromStorage = getSignupCompleteFlowName(); // The flow for the Checkout page
	const flowFromURL = getFlowFromURL(); // The flow for the Plans step
	const flow = flowFromStorage || flowFromURL;
	// Only onboarding flow is eligible for streamlined pricing. Akismet/Jetpack checkouts are excluded as well.
	return flow === 'onboarding' && ! isAkismetCheckout() && ! isJetpackCheckout();
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

export function isStreamlinedPriceCheckoutTreatment( variationName?: string | null ) {
	if ( ! variationName ) {
		return false;
	}
	return ! variationName.includes( 'checkout_control' );
}

export function isStreamlinedPriceRadioTreatment( variationName?: string | null ) {
	if ( ! variationName ) {
		return false;
	}
	return variationName.includes( 'checkout_radio' );
}

export function isStreamlinedPriceDropdownTreatment( variationName?: string | null ) {
	if ( ! variationName ) {
		return false;
	}
	return variationName.includes( 'checkout_dropdown' );
}
