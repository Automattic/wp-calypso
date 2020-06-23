/**
 * External dependencies
 */
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { PLANS_STORE } from '../stores';

export function useSelectedPlan() {
	const selectedPlan = useSelect( ( select ) => {
		window.__debug_plans_store = select( PLANS_STORE );
		return select( PLANS_STORE ).getSelectedPlan();
	} );

	// TODO: Review the full code from gutenboarding. This is just to see if connecting to plans store work.

	return selectedPlan;
}
