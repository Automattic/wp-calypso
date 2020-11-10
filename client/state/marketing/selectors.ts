/**
 * Internal Dependencies
 */
import type { AppState } from 'calypso/types';
import { getVariationForUser } from 'calypso/state/experiments/selectors';

export function isTreatmentInMonthlyPricingTest( state: AppState ): boolean {
	return (
		'treatment' === getVariationForUser( state, 'monthly_pricing_test_phase_2_us_en' ) ||
		'treatment' === getVariationForUser( state, 'monthly_pricing_test_phase_2_eu' ) ||
		[ 'control', 'treatment' ].includes(
			getVariationForUser( state, 'monthly_pricing_test_phase_2_latam' ) || ''
		)
	);
}
