import { getFlowFromURL } from 'calypso/landing/stepper/utils/get-flow-from-url';
import isAkismetCheckout from 'calypso/lib/akismet/is-akismet-checkout';
import { useExperiment } from 'calypso/lib/explat';
import isJetpackCheckout from 'calypso/lib/jetpack/is-jetpack-checkout';
import { getSignupCompleteFlowName } from 'calypso/signup/storageUtils';

const RENEWAL_PRICING_EXPERIMENT_NAME = 'wpcom_renewal_pricing_increase_usd_202512_v1';

export function useRenewalPricingExperiment(
	flowName?: string | null
): [ boolean, string | null ] {
	const [ isLoadingExperiment, assignment ] = useExperiment( RENEWAL_PRICING_EXPERIMENT_NAME, {
		isEligible: isEligibleForExperiment( flowName ),
	} );

	return [ isLoadingExperiment, assignment?.variationName ?? null ];
}

function isEligibleForExperiment( flowName?: string | null ): boolean {
	const flowFromStorage = getSignupCompleteFlowName(); // The flow for the Checkout page
	const flowFromURL = getFlowFromURL(); // The flow for the Plans step
	const flow = flowName || flowFromStorage || flowFromURL;

	// onboarding-pm flow is ineligible for streamlined pricing. Akismet/Jetpack checkouts are excluded as well.
	return flow !== 'onboarding-pm' && ! isAkismetCheckout() && ! isJetpackCheckout();
}

export function isRenewalPricingTreatment( variationName?: string | null ) {
	if ( ! variationName ) {
		return false;
	}
	return variationName.includes( 'crossed_price' );
}
