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
import useRecommendedPlan from './use-recommended-plan';

export function usePlanFromPath() {
	const planPath = usePlanRouteParam();
	return useSelect( ( select ) => select( PLANS_STORE ).getPlanByPath( planPath ) );
}

export function useSelectedPlan() {
	const selectedPlan = useSelect( ( select ) => select( ONBOARD_STORE ).getPlan() );
	const recommendedPlan = useRecommendedPlan();
	const isPlanFree = useSelect( ( select ) => select( PLANS_STORE ).isPlanFree );

	const hasPaidDomain = useSelect( ( select ) => select( ONBOARD_STORE ).hasPaidDomain() );
	const hasPaidDesign = useSelect( ( select ) => select( ONBOARD_STORE ).hasPaidDesign() );

	const defaultPaidPlan = useSelect( ( select ) => select( PLANS_STORE ).getDefaultPaidPlan() );

	const planFromPath = usePlanFromPath();

	// Use recommendedPlan with priority over the plan derived from domain and design selection
	const defaultPlan =
		recommendedPlan || ( ( hasPaidDomain || hasPaidDesign ) && defaultPaidPlan ) || undefined;

	// If the selected plan is free and the user selection determines a paid plan, return the paid plan
	if ( isPlanFree( selectedPlan?.storeSlug ) && defaultPlan ) {
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

export function useHasPaidPlanFromPath() {
	const planFromPath = usePlanFromPath();
	const isPlanFree = useSelect( ( select ) => select( PLANS_STORE ).isPlanFree );
	return planFromPath && ! isPlanFree( planFromPath?.storeSlug );
}

export function useShouldSiteBePublic() {
	const currentSlug = useSelectedPlan()?.storeSlug;
	return useSelect( ( select ) => select( PLANS_STORE ).isPlanEcommerce( currentSlug ) );
}
