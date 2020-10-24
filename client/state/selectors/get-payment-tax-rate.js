/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/payment/init';

/**
 * Returns the current user's tax rate.
 *
 * @param {object} state - The current global state tree.
 * @returns {?number} - The current combined tax rate, or null.
 */
export default function getPaymentTaxRate( state ) {
	return get( state, [ 'payment', 'taxRate' ], null );
}
