/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/payment/init';

/**
 * Returns the current payment country.
 *
 * @param {object} state - The current global state tree.
 * @returns {?string} - The current payment country, or null.
 */
export default function getPaymentCountryCode( state ) {
	return get( state, [ 'payment', 'countryCode' ], null );
}
