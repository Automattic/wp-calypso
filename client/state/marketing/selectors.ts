/**
 * External Dependencies
 */
import cookie from 'cookie';

/**
 * Internal Dependencies
 */
import type { AppState } from 'calypso/types';
import { getVariationForUser } from 'calypso/state/experiments/selectors';
import { getCurrentUser } from 'calypso/state/current-user/selectors';

export function isTreatmentInMonthlyPricingTest( state: AppState ): boolean {
	const countryCode =
		typeof document !== 'undefined' && cookie.parse( document.cookie )?.country_code;

	return (
		'treatment' === getVariationForUser( state, 'monthly_pricing_test_phase_2_us_en' ) ||
		'treatment' === getVariationForUser( state, 'monthly_pricing_test_phase_2_eu' ) ||
		[ 'AR', 'CL', 'CO' ].includes( countryCode || '' )
	);
}

export function isTreatmentOneClickTest( state: AppState ): boolean {
	return 'treatment' === getVariationForUser( state, 'one_click_premium_plan_upgrade_v3' );
}

export function isTreatmentPlansReorderTest( state: AppState ): boolean {
	return 'treatment' === getCurrentUser( state )?.meta.plans_reorder_abtest_variation;
}
