/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns the current user's tax rate.
 *
 * @param {object} state - The current global state tree.
 * @returns {?float} - The current combined tax rate, or null.
 */
export default function getPaymentTaxRate( state ) {
	return get( state, 'ui.payment.taxRate', null );
}
