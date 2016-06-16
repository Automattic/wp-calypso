/**
 * External Dependencies
 */
import get from 'lodash/get';

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
	( state, productId ) => getPlans( state ).filter( plan => plan.product_id === productId ).shift(),
	( state ) => getPlans( state )
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
