import { isFreePlan } from '@automattic/calypso-products';
import { isPopularPlan } from '../hooks/data-store/is-popular-plan';
import type { GridPlan } from '../types';

export function sortPlans(
	gridPlans: GridPlan[],
	currentSitePlanProductSlug?: string | null,
	isMobile?: boolean
): GridPlan[] {
	let firstPlanIndex = -1;

	// Try to find the current paid plan in the plans list
	if ( currentSitePlanProductSlug && ! isFreePlan( currentSitePlanProductSlug ) ) {
		firstPlanIndex = gridPlans.findIndex( ( gridPlan ) => {
			return gridPlan.planSlug === currentSitePlanProductSlug;
		} );
	}

	if ( firstPlanIndex < 0 ) {
		// Site is on a free plan or the current plan is not in the list. Try to find the popular plan.
		firstPlanIndex = gridPlans.findIndex( ( { planSlug } ) => {
			return isPopularPlan( planSlug );
		} );
		// If the popular plan exists, on mobile, it will be second plan for comparison.
		if ( firstPlanIndex > 0 && isMobile ) {
			firstPlanIndex = firstPlanIndex - 1;
		}
	}

	if ( firstPlanIndex < 0 ) {
		return gridPlans;
	}

	return [
		// The first plan
		gridPlans[ firstPlanIndex ],
		// Rest of the plans in default order
		...gridPlans.slice( firstPlanIndex + 1 ),
		// Leftover plans (before the first plan) in descending order of value
		...gridPlans.slice( 0, firstPlanIndex ).sort( ( planA, planB ) => {
			return (
				( planB?.pricing.originalPrice.full || 0 ) - ( planA?.pricing.originalPrice.full || 0 )
			);
		} ),
	].filter( ( gridPlan ) => Boolean( gridPlan ) );
}
