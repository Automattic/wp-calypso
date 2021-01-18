/**
 * Internal Dependencies
 */
import type { AppState } from 'calypso/types';
import { getVariationForUser } from 'calypso/state/experiments/selectors';
import { getCurrentUser } from 'calypso/state/current-user/selectors';

export function isTreatmentOneClickTest( state: AppState ): boolean {
	return 'treatment' === getVariationForUser( state, 'one_click_premium_plan_upgrade_v3' );
}

export function isTreatmentPlansReorderTest( state: AppState ): boolean {
	return 'treatment' === getCurrentUser( state )?.meta.plans_reorder_abtest_variation;
}
