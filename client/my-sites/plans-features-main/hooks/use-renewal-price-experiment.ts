import { Plans } from '@automattic/data-stores';
import { useLocale } from '@automattic/i18n-utils';
import { getFlowFromURL } from 'calypso/landing/stepper/utils/get-flow-from-url';
import isAkismetCheckout from 'calypso/lib/akismet/is-akismet-checkout';
import isJetpackCheckout from 'calypso/lib/jetpack/is-jetpack-checkout';
import { getSignupCompleteFlowName } from 'calypso/signup/storageUtils';
import { useSelector } from 'calypso/state';
import { getCurrentUserDate } from 'calypso/state/current-user/selectors';

function useCurrencyFromPlans(): string | undefined {
	const plans = Plans.usePlans( { coupon: undefined } );
	const firstPlan = plans.data && Object.values( plans.data )[ 0 ];
	return firstPlan?.pricing?.currencyCode;
}

export function useRenewalPricingExperiment(
	flowName?: string | null
): [ boolean, string | null ] {
	const locale = useLocale();
	const currencyCode = useCurrencyFromPlans();
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

const REGISTRATION_DATE_CUTOFF = new Date( '2026-03-31T05:00:00Z' );

function isNewUserOrLoggedOut( registrationDate: string | null | undefined ): boolean {
	if ( ! registrationDate ) {
		return true;
	}

	return new Date( registrationDate ) >= REGISTRATION_DATE_CUTOFF;
}

export function isRenewalPricingTreatment( variationName?: string | null ) {
	if ( ! variationName ) {
		return false;
	}
	return variationName.includes( 'crossed_price' );
}
