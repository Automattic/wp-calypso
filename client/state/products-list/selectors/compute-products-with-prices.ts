import { getTermDuration } from '@automattic/calypso-products';
import { get } from 'lodash';
import { computeFullAndMonthlyPricesForPlan } from './compute-full-and-monthly-prices-for-plan';
import { getProductsList } from './get-products-list';
import { planSlugToPlanProduct } from './plan-slug-to-plan-product';
import type { FullAndMonthlyPrices } from './compute-full-and-monthly-prices-for-plan';
import type { TestFilteredPlan } from './plan-slug-to-plan-product';
import type { AppState } from 'calypso/types';

/**
 * Turns a list of plan slugs into a list of plan objects, corresponding
 * products, and their full and monthly prices
 */
export const computeProductsWithPrices = (
	state: AppState,
	siteId: number,
	planSlugs: string[]
): FullAndMonthlyPrices[] => {
	const products = getProductsList( state );

	return planSlugs
		.map( ( plan ) => planSlugToPlanProduct( products, plan ) )
		.filter( ( planProduct ) => planProduct.plan && get( planProduct, [ 'product', 'available' ] ) )
		.map( ( availablePlanProduct ) => ( {
			...availablePlanProduct,
			...computeFullAndMonthlyPricesForPlan(
				state,
				siteId,
				// Type casting the plan to be non-null is safe here and below because
				// we have already filtered out falsy plans above, although TS can't
				// figure that out.
				availablePlanProduct.plan as TestFilteredPlan
			),
		} ) )
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
