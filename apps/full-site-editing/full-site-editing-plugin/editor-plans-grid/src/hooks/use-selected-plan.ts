/**
 * External dependencies
 */
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { PLANS_STORE } from '../stores';

export function useSelectedPlan() {
	// TODO: Switch to paid plan when use switch to paid domain.
	const currentPlan = useSelect( ( select ) => {
		return select( PLANS_STORE ).getSelectedPlan();
	} );

	// FIX: PlansGrid currentPlan params expecting undefined while `getSelectedPlan()` is returning null.
	return currentPlan || undefined;
}
