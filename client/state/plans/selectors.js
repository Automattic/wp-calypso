/** @format */
/**
 * External Dependencies
 */
import { get, find } from 'lodash';

/**
 * Internal Dependencies
 */
import createSelector from 'lib/create-selector';

/**
 * Return WordPress plans getting from state object
 *
 * @param {Object} state - current state object
 * @return {Array} WordPress plans
 */
export const getPlans = state => {
	return state.plans.items;
};

/**
 * Return requesting state
 *
 * @param {Object} state - current state object
 * @return {Boolean} is plans requesting?
 */
export const isRequestingPlans = state => {
	return state.plans.requesting;
};

/**
 * Returns a plan
 * @param  {Object} state      global state
 * @param  {Number} productId  the plan productId
 * @return {Object} the matching plan
 */
export const getPlan = createSelector(
	( state, productId ) => find( getPlans( state ), { product_id: productId } ),
	state => getPlans( state )
);

/**
 * Returns a plan searched by its slug
 * @param  {Object} state      global state
 * @param  {String} planSlug the plan slug
 * @return {Object} the matching plan
 */
export const getPlanBySlug = createSelector(
	( state, planSlug ) => find( getPlans( state ), { product_slug: planSlug } ),
	state => getPlans( state )
);

/**
 * Returns a plan price
 * @param  {Object}  state     global state
 * @param  {Number}  productId the plan productId
 * @param  {Boolean} isMonthly if true, returns monthly price
 * @return {Number}  plan price
 */
export function getPlanRawPrice( state, productId, isMonthly = false ) {
	const plan = getPlan( state, productId );
	if ( get( plan, 'raw_price', -1 ) < 0 ) {
		return null;
	}
	return isMonthly ? parseFloat( ( plan.raw_price / 12 ).toFixed( 2 ) ) : plan.raw_price;
}

/**
 * Returns a plan product_slug. Useful for getting a cartItem for a plan.
 *
 * @param  {Object}  state     global state
 * @param  {Number}  productId the plan productId
 * @return {String}  plan product_slug
 */
export function getPlanSlug( state, productId ) {
	const plan = getPlan( state, productId );

	return get( plan, 'product_slug', null );
}
