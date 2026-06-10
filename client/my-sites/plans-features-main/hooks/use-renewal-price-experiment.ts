import { Plans } from '@automattic/data-stores';
import { useLocale } from '@automattic/i18n-utils';
import { getFlowFromURL } from 'calypso/landing/stepper/utils/get-flow-from-url';
import isAkismetCheckout from 'calypso/lib/akismet/is-akismet-checkout';
import { useExperiment } from 'calypso/lib/explat';
import isJetpackCheckout from 'calypso/lib/jetpack/is-jetpack-checkout';
import { getSignupCompleteFlowName } from 'calypso/signup/storageUtils';
import { useSelector } from 'calypso/state';
import { getCurrentUserDate } from 'calypso/state/current-user/selectors';

const RENEWAL_PRICING_EXPERIMENT_V2_EN_USD = 'wpcom_renewal_pricing_increase_v2_usd_202604_v1';
const RENEWAL_PRICING_EXPERIMENT_V2_NON_USD = 'wpcom_renewal_pricing_increase_v2_non_usd_202604_v1';

function useCurrencyFromPlans(): string | undefined {
	const plans = Plans.usePlans( { coupon: undefined } );
	const firstPlan = plans.data && Object.values( plans.data )[ 0 ];
	return firstPlan?.pricing?.currencyCode;
}

function useIsEligibleForV1EnUSDExperiment(
	flowName: string | null | undefined,
	locale: string,
	currencyCode: string | undefined
): [ boolean, string | null ] {
	const REGISTRATION_DATE_CUTOFF = new Date( '2026-03-31T11:00:00Z' );

	function isNewUserOrLoggedOut( registrationDate: string | null | undefined ): boolean {
		if ( ! registrationDate ) {
			return true;
		}

		return new Date( registrationDate ) >= REGISTRATION_DATE_CUTOFF;
	}

	const userRegistrationDate = useSelector( getCurrentUserDate );

	const flowFromStorage = getSignupCompleteFlowName();
	const flowFromURL = getFlowFromURL();
	const flow = flowName || flowFromStorage || flowFromURL;

	if ( isAkismetCheckout() || isJetpackCheckout() ) {
		return [ false, null ];
	}

	if ( locale !== 'en' ) {
		return [ false, null ];
	}

	if ( currencyCode !== 'USD' ) {
		return [ false, null ];
	}

	if ( ! isNewUserOrLoggedOut( userRegistrationDate ) ) {
		return [ false, null ];
	}

	if ( flow === 'onboarding-pm' || flow === 'onboarding-affiliate' ) {
		return [ false, null ];
	}

	return [ false, 'crossed_price' ];
}

function isEligibleForExperiment( flowName?: string | null ): boolean {
	const flowFromStorage = getSignupCompleteFlowName(); // The flow for the Checkout page
	const flowFromURL = getFlowFromURL(); // The flow for the Plans step
	const flow = flowName || flowFromStorage || flowFromURL;

	// onboarding-pm and onboarding-affiliate flows are ineligible for streamlined pricing. Akismet/Jetpack checkouts are excluded as well.
	return (
		flow !== 'onboarding-pm' &&
		flow !== 'onboarding-affiliate' &&
		! isAkismetCheckout() &&
		! isJetpackCheckout()
	);
}

export function useRenewalPricingExperiment(
	flowName?: string | null
): [ boolean, string | null ] {
	const locale = useLocale();
	const currencyCode = useCurrencyFromPlans();
	const [ isLoadingV1, v1Variation ] = useIsEligibleForV1EnUSDExperiment(
		flowName,
		locale,
		currencyCode
	);
	const [ isLoadingV2EnUsd, v2EnUsdAssignment ] = useExperiment(
		RENEWAL_PRICING_EXPERIMENT_V2_EN_USD,
		{
			// EN locale and USD currency required; skip until plans are loaded.
			isEligible: locale === 'en' && currencyCode === 'USD' && isEligibleForExperiment( flowName ),
		}
	);
	const [ isLoadingV2NonUsd, v2NonUsdAssignment ] = useExperiment(
		RENEWAL_PRICING_EXPERIMENT_V2_NON_USD,
		{
			// Eligible when the user is either non-EN or non-USD. A non-EN locale
			// is sufficient on its own (no need to wait for plans to load); for EN
			// users we additionally wait for the currency to confirm it's non-USD.
			isEligible:
				( locale !== 'en' || ( currencyCode !== undefined && currencyCode !== 'USD' ) ) &&
				isEligibleForExperiment( flowName ),
		}
	);
	const isLoadingExperiment = isLoadingV1 || isLoadingV2EnUsd || isLoadingV2NonUsd;
	const variationName =
		v2NonUsdAssignment?.variationName ?? v2EnUsdAssignment?.variationName ?? v1Variation;
	return [ isLoadingExperiment, isLoadingExperiment ? null : variationName ];
}

export function isRenewalPricingTreatment( variationName?: string | null ) {
	return Boolean( variationName );
}
