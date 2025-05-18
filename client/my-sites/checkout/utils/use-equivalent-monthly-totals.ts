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
	const isEligibleProduct = ( product: ResponseCartProduct ) =>
		isWpComPlan( product?.product_slug ) && ! isMonthly( product?.product_slug );

	const monthlyProductSlugs = useMemo( () => {
		return products
			.filter( isEligibleProduct )
			.reduce( ( slugs: PlanSlug[], product: ResponseCartProduct ) => {
				if ( ! slugs.includes( product.product_slug as PlanSlug ) ) {
					slugs.push( getMonthlyPlanByYearly( product.product_slug ) as PlanSlug );
				}
				return slugs;
			}, [] );
	}, [ products ] );
	const pricing =
		Plans.usePricingMetaForGridPlans( {
			planSlugs: monthlyProductSlugs,
			siteId: undefined,
			coupon: undefined,
			useCheckPlanAvailabilityForPurchase,
		} ) || {};
	const monthlyEquivalentTotals = useMemo( () => {
		return products.filter( isEligibleProduct ).reduce(
			( prices, product ) => {
				const monthlyPlan = getMonthlyPlanByYearly( product.product_slug );
				prices[ product.product_slug as PlanSlug ] =
					( product.months_per_bill_period ?? 0 ) *
					( pricing[ monthlyPlan ]?.originalPrice?.monthly ?? 0 );
				return prices;
			},
			{} as Record< PlanSlug, number >
		);
	}, [ products, pricing ] );
	return monthlyEquivalentTotals;
}
