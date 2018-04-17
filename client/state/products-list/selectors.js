/** @format */

/**
 * External dependencies
 */

import { pickBy, get } from 'lodash';

/**
 * Internal dependencies
 */

import { abtest } from 'lib/abtest';
import { getPlanDiscountedRawPrice } from 'state/sites/plans/selectors';
import { getPlanRawPrice } from 'state/plans/selectors';
import { getPlan, applyTestFiltersToPlansList, getTermDuration } from 'lib/plans';

export function isProductsListFetching( state ) {
	return state.productsList.isFetching;
}

export function getProductsList( state ) {
	return state.productsList.items;
}

export function getAvailableProductsList( state ) {
	return pickBy( state.productsList.items, product => product.available );
}

/**
 * Returns the display price of a product
 *
 * @param {Object} state The Redux state tree
 * @param {string} productSlug The internal product slug, eg 'jetpack_premium'
 * @return {string} The display price formatted in the user's currency, eg "A$29.00"
 */
export function getProductDisplayCost( state, productSlug ) {
	const product = state.productsList.items[ productSlug ];
	if ( ! product ) {
		return null;
	}

	return product.cost_display;
}

/**
 * Computes a price based on plan slug/constant, including any discounts available.
 *
 * @param {Object} state Current redux state
 * @param {Number} siteId Site ID to consider
 * @param {Object} planObject Plan object returned by getPlan() from lib/plans
 * @param {boolean} isMonthly Flag - should return a monthly price?
 * @return {Number} Requested price
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
 * @param {String} planSlug Plan constant/slug
 * @return {Object} Object with a related plan and product objects
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
 * @param {Object} state Current redux state
 * @param {Number} siteId Site ID to consider
 * @param {Object} planObject Plan object returned by getPlan() from lib/plans
 * @return {Object} Object with a full and monthly price
 */
export const computeFullAndMonthlyPricesForPlan = ( state, siteId, planObject ) => ( {
	priceFull: getPlanPrice( state, siteId, planObject, false ),
	priceMonthly: getPlanPrice( state, siteId, planObject, true ),
} );

/**
 * Turns a list of plan slugs into a list of plan objects, corresponding
 * products, and their full and monthly prices
 *
 * @param {Object} state Current redux state
 * @param {Number} siteId Site ID to consider
 * @param {String[]} planSlugs Plans constants
 * @return {Array} A list of objects as described above
 */
export const computeProductsWithPrices = ( state, siteId, planSlugs ) => {
	const products = getProductsList( state );

	return planSlugs
		.map( plan => planSlugToPlanProduct( products, plan ) )
		.filter( planProduct => planProduct.plan && get( planProduct, [ 'product', 'available' ] ) )
		.map( availablePlanProduct => ( {
			...availablePlanProduct,
			...computeFullAndMonthlyPricesForPlan( state, siteId, availablePlanProduct.plan ),
		} ) )
		.filter( availablePlanProduct => availablePlanProduct.priceFull )
		.sort( ( a, b ) => getTermDuration( a.plan.term ) - getTermDuration( b.plan.term ) );
};
