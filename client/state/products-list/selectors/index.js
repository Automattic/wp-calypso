/**
 * External dependencies
 */
import { get, max } from 'lodash';

/**
 * Internal dependencies
 */
import { getPlanRawPrice } from 'state/plans/selectors';
import { getTermDuration } from 'lib/plans/constants';

import { getProductsList } from './get-products-list';
import { getPlanPrice } from './get-plan-price';
import { planSlugToPlanProduct } from './plan-slug-to-plan-product';

import 'state/products-list/init';

export { isProductsListFetching } from './is-products-list-fetching';
export { getProductsList } from './get-products-list';
export { getAvailableProductsList } from './get-available-products-list';
export { getProductBySlug } from './get-product-by-slug';
export { getProductDisplayCost } from './get-product-display-cost';
export { getProductCost } from './get-product-cost';
export { getPlanPrice } from './get-plan-price';
export { planSlugToPlanProduct } from './plan-slug-to-plan-product';

/**
 * Computes a full and monthly price for a given plan, based on it's slug/constant
 *
 * @param {object} state Current redux state
 * @param {number} siteId Site ID to consider
 * @param {object} planObject Plan object returned by getPlan() from lib/plans
 * @param {number} credits The number of free credits in cart
 * @param {object} couponDiscounts Absolute values of any discounts coming from a discount coupon
 * @returns {object} Object with a full and monthly price
 */
export const computeFullAndMonthlyPricesForPlan = (
	state,
	siteId,
	planObject,
	credits,
	couponDiscounts
) => {
	const couponDiscount = couponDiscounts[ planObject.getProductId() ] || 0;

	return {
		priceFullBeforeDiscount: getPlanRawPrice( state, planObject.getProductId(), false ),
		priceFull: getPlanPrice( state, siteId, planObject, false ),
		priceFinal: max( [
			getPlanPrice( state, siteId, planObject, false ) - credits - couponDiscount,
			0,
		] ),
		priceMonthly: getPlanPrice( state, siteId, planObject, true ),
	};
};

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
