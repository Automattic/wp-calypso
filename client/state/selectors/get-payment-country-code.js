/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns the current payment country.
 *
 * @param {Object} state - The current global state tree.
 * @return {?string} - The current payment country, or null.
 */
export default function getPaymentCountryCode( state ) {
	return get( state, 'ui.payment.countryCode', null );
}
