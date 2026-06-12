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
		coupon: undefined,
		useCheckPlanAvailabilityForPurchase,
		withProratedDiscounts: true,
	} );
	const { data: sitePlans } = Plans.useSitePlans( { siteId, coupon: undefined } );

	if ( ! siteId || ! pricing ) {
		return 0;
	}

	const creditsPerPlan = plans.map( ( planSlug ) => {
		if ( ! planAvailabilityForPurchase[ planSlug ] ) {
			return 0;
		}

		/**
		 * For multi-year prorated upgrades (e.g. a site with a far-future expiry), the API
		 * returns the total N-year proration credit in the cost_overrides entry rather than in
		 * raw_discount_integer (which only carries the per-year equivalent). Using oldPrice –
		 * newPrice from the override gives the full credit the user will see at checkout.
		 */
		const sitePlan = sitePlans?.[ planSlug ];
		const proratedOverride = sitePlan?.pricing?.costOverrides?.find(
			( { overrideCode } ) =>
				overrideCode === Plans.COST_OVERRIDE_REASONS.RECENT_PLAN_PRORATION ||
				overrideCode === Plans.COST_OVERRIDE_REASONS.RECENT_DOMAIN_PRORATION
		);
		if ( proratedOverride ) {
			// old_price / new_price in cost_overrides are in major currency units (e.g. dollars),
			// whereas the rest of the pricing data uses smallest units (e.g. cents). Convert to
			// smallest units using Intl.NumberFormat so zero-decimal currencies (e.g. JPY) are
			// handled correctly rather than hardcoding * 100.
			const currencyCode = sitePlan?.pricing?.currencyCode ?? 'USD';
			const precision = new Intl.NumberFormat( 'en-US', {
				style: 'currency',
				currency: currencyCode,
			} ).resolvedOptions().maximumFractionDigits;
			return Math.round(
				( proratedOverride.oldPrice - proratedOverride.newPrice ) * 10 ** ( precision ?? 2 )
			);
		}

		// Fallback: non-prorated discounts (e.g. sale coupons with upgrade credits).
		const discountedPrice = pricing?.[ planSlug ]?.discountedPrice.full;
		const originalPrice = pricing?.[ planSlug ]?.originalPrice.full;

		if ( typeof discountedPrice !== 'number' || typeof originalPrice !== 'number' ) {
			return 0;
		}

		return originalPrice - discountedPrice;
	} );

	return Math.max( ...creditsPerPlan );
}
