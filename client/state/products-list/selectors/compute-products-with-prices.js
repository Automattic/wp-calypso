import { getTermDuration } from '@automattic/calypso-products';
import { get } from 'lodash';
import { computeFullAndMonthlyPricesForPlan } from './compute-full-and-monthly-prices-for-plan';
import { getProductsList } from './get-products-list';
import { planSlugToPlanProduct } from './plan-slug-to-plan-product';

/**
 * Turns a list of plan slugs into a list of plan objects, corresponding
 * products, and their full and monthly prices
 *
 * @param {object} state Current redux state
 * @param {number|undefined} siteId Site ID to consider
 * @param {string[]} planSlugs Plans constants
 * @returns {Array} A list of objects as described above
 */
export const computeProductsWithPrices = ( state, siteId, planSlugs ) => {
	const products = getProductsList( state );

	return planSlugs
		.map( ( plan ) => planSlugToPlanProduct( products, plan ) )
		.filter( ( planProduct ) => planProduct.plan && get( planProduct, [ 'product', 'available' ] ) )
		.map( ( availablePlanProduct ) => ( {
			...availablePlanProduct,
			...computeFullAndMonthlyPricesForPlan( state, siteId, availablePlanProduct.plan ),
		} ) )
		.filter( ( availablePlanProduct ) => availablePlanProduct.priceFull )
		.sort( ( a, b ) => getTermDuration( a.plan.term ) - getTermDuration( b.plan.term ) );
};
