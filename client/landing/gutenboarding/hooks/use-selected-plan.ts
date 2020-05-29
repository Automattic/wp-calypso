/**
 * External dependencies
 */
import { useSelect } from '@wordpress/data';
import { Plans } from '@automattic/data-stores';

/**
 * Internal dependencies
 */
import { STORE_KEY as ONBOARD_STORE } from '../stores/onboard';
import { usePlanRouteParam } from '../path';

const PLANS_STORE = Plans.register();

export function useSelectedPlan() {
	const selectedPlan = useSelect( ( select ) => select( PLANS_STORE ).getSelectedPlan() );

	const planPath = usePlanRouteParam();
	const planFromPath = useSelect( ( select ) => select( PLANS_STORE ).getPlanByPath( planPath ) );

	const hasPaidDomain = useSelect( ( select ) => select( ONBOARD_STORE ).hasPaidDomain() );
	const hasPaidDesign = useSelect( ( select ) => select( ONBOARD_STORE ).hasPaidDesign() );
	const defaultPlan = useSelect( ( select ) =>
		select( PLANS_STORE ).getDefaultPlan( hasPaidDomain, hasPaidDesign )
	);

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
