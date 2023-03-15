import { isEnabled } from '@automattic/calypso-config';
import {
	JETPACK_REDIRECT_CHECKOUT_TO_WPADMIN,
	BEST_VALUE_PLANS,
	TERM_MONTHLY,
	PLAN_MONTHLY_PERIOD,
	TERM_ANNUALLY,
	PLAN_ANNUAL_PERIOD,
	TERM_BIENNIALLY,
	PLAN_BIENNIAL_PERIOD,
	TERM_TRIENNIALLY,
	PLAN_TRIENNIAL_PERIOD,
} from './constants';

export function isBestValue( plan: string ): boolean {
	return ( BEST_VALUE_PLANS as ReadonlyArray< string > ).includes( plan );
}

/**
 * Return estimated duration of given PLAN_TERM in days
 *
 * @param {string} term TERM_ constant
 * @returns {number} Term duration
 */
export function getTermDuration( term: string ): number | undefined {
	switch ( term ) {
		case TERM_MONTHLY:
			return PLAN_MONTHLY_PERIOD;

		case TERM_ANNUALLY:
			return PLAN_ANNUAL_PERIOD;

		case TERM_BIENNIALLY:
			return PLAN_BIENNIAL_PERIOD;

		case TERM_TRIENNIALLY:
			return PLAN_TRIENNIAL_PERIOD;
	}
}

export const redirectCheckoutToWpAdmin = (): boolean => !! JETPACK_REDIRECT_CHECKOUT_TO_WPADMIN;

/**
 * Returns if the 2023 Pricing grid feature has been enabled.
 * Currently this depends on the feature flag.
 *
 */
export const is2023PricingGridEnabled = (): boolean => {
	return isEnabled( 'onboarding/2023-pricing-grid' );
};

/**
 * This function specifically checks if a given route path will display the pricing grid or not.
 * However the pricing grid needs to be enabled in the first place for this function to return true.
 *
 * @param browserWindow Current browser window
 * @returns true if the pricing grid maybe shown in a given page
 */
export const is2023PricingGridActivePage = (
	browserWindow?: Window & typeof globalThis,
	pathname?: string
): boolean => {
	const currentRoutePath = pathname ?? browserWindow?.location.pathname ?? '';
	const isPricingGridEnabled = is2023PricingGridEnabled();

	// Is this the internal plans page /plans/<site-slug> ?
	if ( currentRoutePath.startsWith( '/plans' ) ) {
		return isPricingGridEnabled;
	}

	// Is this the onboarding flow?
	if ( currentRoutePath.startsWith( '/start/plans' ) ) {
		return isPricingGridEnabled;
	}

	// Is this the launch site flow?
	if ( currentRoutePath.startsWith( '/start/launch-site/plans-launch' ) ) {
		return isPricingGridEnabled;
	}

	// Is this the stepper domain upsell flow?
	if ( currentRoutePath.startsWith( '/setup/domain-upsell' ) ) {
		return isPricingGridEnabled;
	}

	return false;
};
