import type { GridPlan } from '../types';

export function sortPlans(
	gridPlans: GridPlan[],
	currentSitePlanProductSlug?: string | null
): GridPlan[] {
	// If we don't have plans to sort, return empty array
	if ( ! gridPlans.length ) {
		return [];
	}
	// If we have a current site plan and we're on mobile, sort to prioritize it
	if ( currentSitePlanProductSlug ) {
		return [ ...gridPlans ].sort( ( planA, planB ) => {
			// If planA is the current plan, it should come first (-1 moves it up)
			if ( planA.planSlug === currentSitePlanProductSlug ) {
				return -1;
			}
			// If planB is the current plan, it should come first (1 moves planA down)
			if ( planB.planSlug === currentSitePlanProductSlug ) {
				return 1;
			}
			// Otherwise, maintain original order
			return 0;
		} );
	}
	return [ ...gridPlans ];
}
