import 'calypso/state/currency-code/init';

/**
 * Returns the currency code for the current user.
 *
 * @param  {Object}  state  Global state tree
 * @returns {?string}        Current currency code
 */
export function getCurrentUserCurrencyCode( state ) {
	return state.currencyCode;
}
