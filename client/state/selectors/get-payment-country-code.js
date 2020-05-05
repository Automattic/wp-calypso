/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns the current payment country.
 *
 * @param {object} state - The current global state tree.
 * @returns {?string} - The current payment country, or null.
 */
export default function getPaymentCountryCode( state ) {
	return get( state, 'ui.payment.countryCode', null );
}
