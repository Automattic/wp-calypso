/**
 * External dependencies
 */

import { get, find } from 'lodash';

/**
 * Internal Dependencies
 */
import createSelector from 'lib/create-selector';
import { calculateMonthlyPriceForPlan } from 'lib/plans';

/**
 * Return WordPress plans getting from state object
 *
 * @param {object} state - current state object
 * @returns {Array} WordPress plans
 */
export const getPlans = ( state ) => {
	return state.plans.items;
};

/**
 * Return requesting state
 *
 * @param {object} state - current state object
 * @returns {boolean} is plans requesting?
 */
export const isRequestingPlans = ( state ) => {
	return state.plans.requesting;
};

/**
 * Returns a plan
 *
 * @param  {object} state      global state
 * @param  {number} productId  the plan productId
 * @returns {object} the matching plan
 */
export const getPlan = createSelector(
	( state, productId ) => find( getPlans( state ), { product_id: productId } ),
	( state ) => getPlans( state )
);

/**
 * Returns a plan searched by its slug
 *
 * @param  {object} state      global state
 * @param  {string} planSlug the plan slug
 * @returns {object} the matching plan
 */
export const getPlanBySlug = createSelector(
	( state, planSlug ) => find( getPlans( state ), { product_slug: planSlug } ),
	( state ) => getPlans( state )
);

/**
 * Returns a plan price
 *
 * @param  {object}  state     global state
 * @param  {number}  productId the plan productId
 * @param  {boolean} isMonthly if true, returns monthly price
 * @returns {number}  plan price
 */
export function getPlanRawPrice( state, productId, isMonthly = false ) {
	const plan = getPlan( state, productId );
	if ( get( plan, 'raw_price', -1 ) < 0 ) {
		return null;
	}

	return isMonthly
		? calculateMonthlyPriceForPlan( plan.product_slug, plan.raw_price )
		: plan.raw_price;
}

/**
 * Returns a plan product_slug. Useful for getting a cartItem for a plan.
 *
 * @param  {object}  state     global state
 * @param  {number}  productId the plan productId
 * @returns {string}  plan product_slug
 */
export function getPlanSlug( state, productId ) {
	const plan = getPlan( state, productId );

	return get( plan, 'product_slug', null );
}
