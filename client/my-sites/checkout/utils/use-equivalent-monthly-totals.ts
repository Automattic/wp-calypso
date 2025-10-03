import {
	isMonthly,
	isWpComPlan,
	getMonthlyPlanByYearly,
	type PlanSlug,
} from '@automattic/calypso-products';
import { Plans } from '@automattic/data-stores';
import { ResponseCartProduct } from '@automattic/shopping-cart';
import { useMemo } from 'react';
import useCheckPlanAvailabilityForPurchase from 'calypso/my-sites/plans-features-main/hooks/use-check-plan-availability-for-purchase';

const isEligibleProduct = ( product: ResponseCartProduct ) =>
	isWpComPlan( product?.product_slug ) && ! isMonthly( product?.product_slug );

/**
 * Calculate the equivalent monthly total prices for non-monthly WordPress.com plans from the passed
 * cart. For each eligible product it'd determine the equivalent monthly plan and return the monthly
 * plan price multiplied by the number of months in the yearly (or longer) plan.
 * Used for demonstrating the benefits of purchasing longer-term plans.
 *
 * @param products - Array of `ResponseCartProduct` items.
 *
 * @returns An object where each key is an eligible plan slug from the cart and the value is the
 *          calculated total cost as if it was billed monthly.
 */
export default function useEquivalentMonthlyTotals(
	products: Array< ResponseCartProduct >
): Record< PlanSlug, number > {
	const eligibleProducts = useMemo( () => products.filter( isEligibleProduct ), [ products ] );

	const monthlyProductSlugs = useMemo( () => {
		const uniqueSlugs = new Set< PlanSlug >();
		for ( const product of eligibleProducts ) {
			uniqueSlugs.add( getMonthlyPlanByYearly( product.product_slug ) as PlanSlug );
		}
		return Array.from( uniqueSlugs );
	}, [ eligibleProducts ] );

	const pricing =
		Plans.usePricingMetaForGridPlans( {
			planSlugs: monthlyProductSlugs,
			siteId: undefined,
			coupon: undefined,
			useCheckPlanAvailabilityForPurchase,
		} ) || {};

	return useMemo(
		() =>
			eligibleProducts.reduce(
				( prices, product ) => ( {
					...prices,
					[ product.product_slug as PlanSlug ]:
						( product.months_per_bill_period ?? 0 ) *
						( pricing[ getMonthlyPlanByYearly( product.product_slug ) ]?.originalPrice?.full ?? 0 ),
				} ),
				{} as Record< PlanSlug, number >
			),
		[ eligibleProducts, pricing ]
	);
}
