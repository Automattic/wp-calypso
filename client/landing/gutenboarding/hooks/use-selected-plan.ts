/**
 * External dependencies
 */
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { STORE_KEY as PLANS_STORE } from '../stores/plans';
import { STORE_KEY as ONBOARD_STORE } from '../stores/onboard';
import { usePlanRouteParam } from '../path';

export function useSelectedPlan() {
	// populate the store
	useSelect( ( select ) => select( PLANS_STORE ).getSupportedPlans() );

	const selectedPlan = useSelect( ( select ) => select( PLANS_STORE ).getSelectedPlan() );

	const planPath = usePlanRouteParam();

	const planFromPath = useSelect( ( select ) => select( PLANS_STORE ).getPlanByPath( planPath ) );

	const hasPaidDomain = useSelect( ( select ) => select( ONBOARD_STORE ).hasPaidDomain() );
	const defaultPlan = useSelect( ( select ) =>
		select( PLANS_STORE ).getDefaultPlan( hasPaidDomain )
	);

	/**
	 * Plan is decided in this order
	 * 1. selected from PlansGrid (by dispatching setPlan)
	 * 2. having the plan slug in the URL
	 * 3. selecting a paid domain
	 */
	return selectedPlan || planFromPath || defaultPlan;
}
