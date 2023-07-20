import { isFreePlan } from '@automattic/calypso-products';
import { isPopularPlan } from '../hooks/npm-ready/data-store/is-popular-plan';
import type { PlanProperties } from '../types';

export function sortPlans(
	planProperties: PlanProperties[],
	currentSitePlanProductSlug?: string | null,
	isMobile?: boolean
): PlanProperties[] {
	let firstPlanIndex = -1;

	// Try to find the current paid plan in the plans list
	if ( currentSitePlanProductSlug && ! isFreePlan( currentSitePlanProductSlug ) ) {
		firstPlanIndex = planProperties.findIndex( ( properties ) => {
			return properties?.planName === currentSitePlanProductSlug;
		} );
	}

	if ( firstPlanIndex < 0 ) {
		// Site is on a free plan or the current plan is not in the list. Try to find the popular plan.
		firstPlanIndex = planProperties.findIndex( ( properties ) => {
			return isPopularPlan( properties.planName );
		} );
		// If the popular plan exists, on mobile, it will be second plan for comparison.
		if ( firstPlanIndex > 0 && isMobile ) {
			firstPlanIndex = firstPlanIndex - 1;
		}
	}

	if ( firstPlanIndex < 0 ) {
		return planProperties;
	}

	return [
		// The first plan
		planProperties[ firstPlanIndex ],
		// Rest of the plans in default order
		...planProperties.slice( firstPlanIndex + 1 ),
		// Leftover plans (before the first plan) in descending order of value
		...planProperties.slice( 0, firstPlanIndex ).sort( ( planA, planB ) => {
			return ( planB?.rawPrice || 0 ) - ( planA?.rawPrice || 0 );
		} ),
	].filter( ( properties ) => Boolean( properties ) );
}
