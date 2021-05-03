/**
 * Internal Dependencies
 */
import type { AppState } from 'calypso/types';
import { getCurrentUser } from 'calypso/state/current-user/selectors';

export function isTreatmentOneClickTest(): boolean {
	return false;
}

export function isTreatmentPlansReorderTest( state: AppState ): boolean {
	return 'treatment' === getCurrentUser( state )?.meta.plans_reorder_abtest_variation;
}
