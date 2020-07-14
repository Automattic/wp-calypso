/**
 * External dependencies
 */
import { get, max } from 'lodash';

/**
 * Internal dependencies
 */
import { abtest } from 'lib/abtest';
import { getPlanDiscountedRawPrice } from 'state/sites/plans/selectors';
import { getPlanRawPrice } from 'state/plans/selectors';
import { getPlan, applyTestFiltersToPlansList } from 'lib/plans';
import { getTermDuration } from 'lib/plans/constants';

import { getProductsList } from './get-products-list';

import 'state/products-list/init';

export { isProductsListFetching } from './is-products-list-fetching';
export { getProductsList } from './get-products-list';
export { getAvailableProductsList } from './get-available-products-list';
export { getProductBySlug } from './get-product-by-slug';
export { getProductDisplayCost } from './get-product-display-cost';
export { getProductCost } from './get-product-cost';

/**
 * Computes a price based on plan slug/constant, including any discounts available.
 *
 * @param {object} state Current redux state
 * @param {number} siteId Site ID to consider
 * @param {object} planObject Plan object returned by getPlan() from lib/plans
 * @param {boolean} isMonthly Flag - should return a monthly price?
 * @returns {number} Requested price
 */
export const getPlanPrice = ( state, siteId, planObject, isMonthly ) => {
	return (
		getPlanDiscountedRawPrice( state, siteId, planObject.getStoreSlug(), { isMonthly } ) ||
		getPlanRawPrice( state, planObject.getProductId(), isMonthly )
	);
};

/**
 * Computes a plan object and a related product object based on plan slug/constant
 *
 * @param {Array[]} products A list of products
 * @param {string} planSlug Plan constant/slug
 * @returns {object} Object with a related plan and product objects
 */
export const planSlugToPlanProduct = ( products, planSlug ) => {
	const plan = getPlan( planSlug );
	const planConstantObj = applyTestFiltersToPlansList( plan, abtest );
	return {
		planSlug,
		plan: planConstantObj,
		product: products[ planSlug ],
	};
};

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
