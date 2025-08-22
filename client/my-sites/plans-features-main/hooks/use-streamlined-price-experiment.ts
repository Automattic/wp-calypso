import { getFlowFromURL } from 'calypso/landing/stepper/utils/get-flow-from-url';
import isAkismetCheckout from 'calypso/lib/akismet/is-akismet-checkout';
import isJetpackCheckout from 'calypso/lib/jetpack/is-jetpack-checkout';
import { getSignupCompleteFlowName } from 'calypso/signup/storageUtils';

export function useStreamlinedPriceExperiment(): [ boolean, string | null ] {
	const variationName = isEligibleForExperiment() ? 'plans_1Y_checkout_radio' : null;

	return [ false, variationName ];
}

function isEligibleForExperiment(): boolean {
	const flowFromStorage = getSignupCompleteFlowName(); // The flow for the Checkout page
	const flowFromURL = getFlowFromURL(); // The flow for the Plans step
	const flow = flowFromStorage || flowFromURL;
	// Only onboarding flow is eligible for streamlined pricing. Akismet/Jetpack checkouts are excluded as well.
	return flow === 'onboarding' && ! isAkismetCheckout() && ! isJetpackCheckout();
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
