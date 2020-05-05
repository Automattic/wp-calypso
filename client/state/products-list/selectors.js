/**
 * External dependencies
 */

import { pickBy, get, max } from 'lodash';

/**
 * Internal dependencies
 */

import { abtest } from 'lib/abtest';
import { getPlanDiscountedRawPrice } from 'state/sites/plans/selectors';
import { getPlanRawPrice } from 'state/plans/selectors';
import { getPlan, applyTestFiltersToPlansList } from 'lib/plans';
import { getTermDuration } from 'lib/plans/constants';

export function isProductsListFetching( state ) {
	return state.productsList.isFetching;
}

export function getProductsList( state ) {
	return state.productsList.items;
}

export function getAvailableProductsList( state ) {
	return pickBy( state.productsList.items, ( product ) => product.available );
}

/**
 * Retrieves the product with the specified slug.
 *
 * @param {object} state - global state tree
 * @param {string} productSlug - internal product slug, eg 'jetpack_premium'
 * @returns {?object} the corresponding product, or null if not found
 */
export function getProductBySlug( state, productSlug ) {
	return get( state, [ 'productsList', 'items', productSlug ], null );
}

/**
 * Returns the display price of the specified product.
 *
 * @param {object} state - global state tree
 * @param {string} productSlug - internal product slug, eg 'jetpack_premium'
 * @returns {?string} the display price formatted in the user's currency (eg 'A$29.00'), or null otherwise
 */
export function getProductDisplayCost( state, productSlug ) {
	const product = getProductBySlug( state, productSlug );

	if ( ! product ) {
		return null;
	}

	return product.cost_display;
}

/**
 * Returns the price of the specified product.
 *
 * @param {object} state - global state tree
 * @param {string} productSlug - internal product slug, eg 'jetpack_premium'
 * @returns {?number} the price formatted in the user's currency (e.g. '29.15'), or null otherwise
 */
export function getProductCost( state, productSlug ) {
	const product = getProductBySlug( state, productSlug );

	if ( ! product ) {
		return null;
	}

	return product.cost;
}

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
