import isAkismetCheckout from 'calypso/lib/akismet/is-akismet-checkout';
import isJetpackCheckout from 'calypso/lib/jetpack/is-jetpack-checkout';

export function useStreamlinedPriceExperiment(): [ boolean, string | null ] {
	const variationName = isEligibleForExperiment() ? 'plans_1Y_checkout_radio' : null;

	return [ false, variationName ];
}

function isEligibleForExperiment(): boolean {
	// Only onboarding flow is eligible for streamlined pricing. Akismet/Jetpack checkouts are excluded as well.
	return ! isAkismetCheckout() && ! isJetpackCheckout();
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
