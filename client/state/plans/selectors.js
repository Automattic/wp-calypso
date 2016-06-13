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
 * Returns a plan price object
 * @param  {Object}  state     global state
 * @param  {Number}  productId the plan productId
 * @param  {Boolean} isMonthly if true, returns monthly price
 * @return {Object}  a plan price object with the following shape:
 * {String} currencySymbol: '$',
 * {String} decimalMark: '.',
 * {String} dollars: '8',
 * {String} cents: '25'
 */
export function getPlanPriceObject( state, productId, isMonthly = false ) {
	const plan = getPlan( state, productId );
	if ( ! plan || ! plan.formatted_price || ! plan.raw_price ) {
		return null;
	}
	// could get $5.95, A$4.13, ¥298, €3,50, etc…
	const getCurrencySymbol = formattedPrice => /(\D+)\d+/.exec( formattedPrice )[ 1 ];
	const currencyDigits = currencySymbol => get( {
		'¥': 0
	}, currencySymbol, 2 );

	const currencySymbol = getCurrencySymbol( plan.formatted_price );
	const price = isMonthly ? ( plan.raw_price / 12 ).toFixed( currencyDigits( currencySymbol ) ) : plan.raw_price;
	const dollars = Math.floor( price );
	const cents = ( price - dollars ) * 100;
	return {
		currencySymbol,
		decimalMark: '.', //hard code this for now until we can get number localization from the server
		dollars,
		cents
	};
}
