import { PLAN_FREE, isFreePlan, type PlanSlug } from '@automattic/calypso-products';

export function isSamePlan( currentSitePlanSlug: string, planSlug: PlanSlug ): boolean {
	// Handles matching variants of the free plan, like PLAN_P2_FREE and PLAN_JETPACK_FREE
	return currentSitePlanSlug === PLAN_FREE
		? isFreePlan( planSlug )
		: currentSitePlanSlug === planSlug;
}
