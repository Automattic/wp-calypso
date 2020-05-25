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
import { PLAN_FREE } from '../stores/plans/constants';

export function useSelectedPlan() {
	const selectedPlan = useSelect( ( select ) => select( PLANS_STORE ).getSelectedPlan() );

	const planPath = usePlanRouteParam();
	const planFromPath = useSelect( ( select ) => select( PLANS_STORE ).getPlanByPath( planPath ) );

	const hasPaidDomain = useSelect( ( select ) => select( ONBOARD_STORE ).hasPaidDomain() );
	const hasPaidDesign = useSelect( ( select ) => select( ONBOARD_STORE ).hasPaidDesign() );

	const defaultPlan = useSelect( ( select ) =>
		select( PLANS_STORE ).getDefaultPlan( hasPaidDomain, hasPaidDesign )
	);

	// If the selected plan is not a paid plan
	// and the user selects a premium domain
	// return the default paid plan.
	if (
		selectedPlan?.getStoreSlug() === PLAN_FREE &&
		defaultPlan?.getStoreSlug() !== PLAN_FREE &&
		! planFromPath &&
		hasPaidDesign
	) {
		return defaultPlan;
	}

	/**
	 * Plan is decided in this order
	 * 1. selected from PlansGrid (by dispatching setPlan)
	 * 2. having the plan slug in the URL
	 * 3. selecting a paid domain or design
	 */
	return selectedPlan || planFromPath || defaultPlan;
}
