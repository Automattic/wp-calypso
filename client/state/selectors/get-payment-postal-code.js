/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns the current payment postal code.
 *
 * @param {Object} state - The current global state tree.
 * @return {?string} - The current payment postal code, or null.
 */
export default function getPaymentPostalCode( state ) {
	return get( state, 'ui.payment.postalCode', null );
}
