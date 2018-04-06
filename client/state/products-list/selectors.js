/** @format */

/**
 * External dependencies
 */

import { pickBy } from 'lodash';

/**
 * Internal dependencies
 */

import { abtest } from 'lib/abtest';
import { getPlanDiscountedRawPrice } from 'state/sites/plans/selectors';
import { getPlanRawPrice } from 'state/plans/selectors';
import { getPlan, applyTestFiltersToPlansList } from 'lib/plans';
import { TERM_MONTHLY } from 'lib/plans/constants';
import createSelector from 'lib/create-selector';

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

export const getDiscountedOrRegularPrice = ( state, siteId, plan, isMonthlyPreference ) => {
	const isMonthly = isMonthlyPreference && plan.term !== TERM_MONTHLY;
	return (
		getPlanDiscountedRawPrice( state, siteId, plan.getStoreSlug(), { isMonthly } ) ||
		getPlanRawPrice( state, plan.getProductId(), isMonthly )
	);
};

export const planSlugToPlanProduct = createSelector( ( products, planSlug ) => {
	const plan = getPlan( planSlug );
	const planConstantObj = applyTestFiltersToPlansList( plan, abtest );
	return {
		planSlug,
		plan: planConstantObj,
		product: products[ planSlug ],
	};
} );

export const computeFullAndMonthlyPricesForPlan = ( state, siteId, plan ) => ( {
	priceFull: getDiscountedOrRegularPrice( state, siteId, plan, false ),
	priceMonthly: getDiscountedOrRegularPrice( state, siteId, plan, true ),
} );

export const computeProductsWithPrices = ( state, siteId, plans ) => {
	const products = getProductsList( state );

	return plans
		.map( p => planSlugToPlanProduct( products, p ) )
		.filter( p => p.plan && p.product && p.product.available )
		.map( object => ( {
			...object,
			...computeFullAndMonthlyPricesForPlan( state, siteId, object.plan ),
		} ) )
		.filter( p => p.priceFull )
		.sort( ( a, b ) => b.priceMonthly - a.priceMonthly );
};
