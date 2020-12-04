/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { getTermDuration } from 'calypso/lib/plans/constants';
import { getProductsList } from './get-products-list';
import { planSlugToPlanProduct } from './plan-slug-to-plan-product';
import { computeFullAndMonthlyPricesForPlan } from './compute-full-and-monthly-prices-for-plan';

/**
 * Turns a list of plan slugs into a list of plan objects, corresponding
 * products, and their full and monthly prices
 *
 * @param {object} state Current redux state
 * @param {number} siteId Site ID to consider
 * @param {string[]} planSlugs Plans constants
 * @param {number} credits The number of free credits in cart
 * @param {object} couponDiscounts Absolute values of any discounts coming from a discount coupon
 * @returns {Array} A list of objects as described above
 */
export const computeProductsWithPrices = ( state, siteId, planSlugs, credits, couponDiscounts ) => {
	const products = getProductsList( state );

	return planSlugs
		.map( ( plan ) => planSlugToPlanProduct( products, plan ) )
		.filter( ( planProduct ) => planProduct.plan && get( planProduct, [ 'product', 'available' ] ) )
		.map( ( availablePlanProduct ) => ( {
			...availablePlanProduct,
			...computeFullAndMonthlyPricesForPlan(
				state,
				siteId,
				availablePlanProduct.plan,
				credits,
				couponDiscounts
			),
		} ) )
		.filter( ( availablePlanProduct ) => availablePlanProduct.priceFull )
		.sort( ( a, b ) => getTermDuration( a.plan.term ) - getTermDuration( b.plan.term ) );
};
