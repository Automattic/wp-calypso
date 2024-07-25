import { Plans } from '@automattic/data-stores';
import useCheckPlanAvailabilityForPurchase from './use-check-plan-availability-for-purchase';
import type { PlanSlug } from '@automattic/calypso-products';

interface Props {
	siteId?: number | null;
	plans: PlanSlug[];
}

/**
 * Calculate available plan credits given a set of displayed plans
 * This is the maximum possible credit value possible when comparing credits per plan
 * @returns {number} The maximum amount of credits possible for a given set of plans
 */
export function useMaxPlanUpgradeCredits( { siteId, plans }: Props ): number {
	const planAvailabilityForPurchase = useCheckPlanAvailabilityForPurchase( {
		planSlugs: plans,
		siteId,
	} );
	const pricing = Plans.usePricingMetaForGridPlans( {
		siteId,
		planSlugs: plans,
		storageAddOns: null,
		coupon: undefined,
		useCheckPlanAvailabilityForPurchase,
		withProratedDiscounts: true,
	} );

	if ( ! siteId || ! pricing ) {
		return 0;
	}

	const creditsPerPlan = plans.map( ( planSlug ) => {
		const discountedPrice = pricing?.[ planSlug ]?.discountedPrice.full;
		const originalPrice = pricing?.[ planSlug ]?.originalPrice.full;

		if (
			! planAvailabilityForPurchase[ planSlug ] ||
			typeof discountedPrice !== 'number' ||
			typeof originalPrice !== 'number'
		) {
			return 0;
		}

		return originalPrice - discountedPrice;
	} );

	return Math.max( ...creditsPerPlan );
}
