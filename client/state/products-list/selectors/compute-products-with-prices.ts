import { getTermDuration } from '@automattic/calypso-products';
import { get } from 'lodash';
import { computeFullAndMonthlyPricesForPlan } from './compute-full-and-monthly-prices-for-plan';
import { getProductsList } from './get-products-list';
import { planSlugToPlanProduct } from './plan-slug-to-plan-product';
import type { TestFilteredPlan, PlanAndProduct } from './plan-slug-to-plan-product';
import type { AvailableProductVariant } from 'calypso/my-sites/checkout/composite-checkout/hooks/product-variants';
import type { AppState } from 'calypso/types';

interface PlanAndProductWithPlan extends PlanAndProduct {
	plan: TestFilteredPlan;
}

/**
 * Turns a list of plan slugs into a list of plan objects, corresponding
 * products, and their full and monthly prices
 */
export const computeProductsWithPrices = (
	state: AppState,
	siteId: number,
	planSlugs: string[]
): AvailableProductVariant[] => {
	const products = getProductsList( state );

	const planAndProducts = planSlugs.map( ( plan ) => planSlugToPlanProduct( products, plan ) );
	const filteredPlanAndProducts = planAndProducts.filter(
		( planProduct ) => planProduct.plan && get( planProduct, [ 'product', 'available' ] )
	) as PlanAndProductWithPlan[];
	const constructedVariants: AvailableProductVariant[] = filteredPlanAndProducts.map(
		( availablePlanProduct ) => ( {
			...availablePlanProduct,
			...computeFullAndMonthlyPricesForPlan( state, siteId, availablePlanProduct.plan ),
		} )
	);

	return constructedVariants
		.filter( ( availablePlanProduct ) => availablePlanProduct.priceFull )
		.sort( ( a, b ) => {
			const durationA = getTermDuration( ( a.plan as TestFilteredPlan ).term );
			const durationB = getTermDuration( ( b.plan as TestFilteredPlan ).term );
			if ( durationA === undefined || durationB === undefined ) {
				return 0;
			}
			return durationA - durationB;
		} );
};
