/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/payment/init';

/**
 * Returns the current payment postal code.
 *
 * @param {object} state - The current global state tree.
 * @returns {?string} - The current payment postal code, or null.
 */
export default function getPaymentPostalCode( state ) {
	return get( state, [ 'payment', 'postalCode' ], null );
}
