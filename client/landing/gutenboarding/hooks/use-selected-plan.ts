/**
 * External dependencies
 */
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { STORE_KEY as ONBOARD_STORE } from '../stores/onboard';
import { PLANS_STORE } from '../stores/plans';
import { usePlanRouteParam } from '../path';

export function useSelectedPlan() {
	const selectedPlan = useSelect( ( select ) => select( PLANS_STORE ).getSelectedPlan() );

	const planPath = usePlanRouteParam();
	const planFromPath = useSelect( ( select ) => select( PLANS_STORE ).getPlanByPath( planPath ) );
	const isPlanFree = useSelect( ( select ) => select( PLANS_STORE ).isPlanFree );

	const hasPaidDomain = useSelect( ( select ) => select( ONBOARD_STORE ).hasPaidDomain() );
	const hasPaidDesign = useSelect( ( select ) => select( ONBOARD_STORE ).hasPaidDesign() );
	const defaultPlan = useSelect( ( select ) =>
		select( PLANS_STORE ).getDefaultPlan( hasPaidDomain, hasPaidDesign )
	);

	// If the selected plan is not a paid plan
	// and the user selects a premium domain
	// return the default paid plan.
	if ( hasPaidDomain && isPlanFree( selectedPlan?.storeSlug ) ) {
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

export function useIsSelectedPlanEcommerce() {
	const currentSlug = useSelectedPlan()?.storeSlug;
	return useSelect( ( select ) => select( PLANS_STORE ).isPlanEcommerce( currentSlug ) );
}

export function useShouldSiteBePublicOnSelectedPlan() {
	return useIsSelectedPlanEcommerce();
}
