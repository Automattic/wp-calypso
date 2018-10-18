/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import config from 'config';

/**
 * Returns the current user's tax rate.
 *
 * @param {Object} state - The current global state tree.
 * @return {?float} - The current combined tax rate, or null.
 */
export default function getTaxRate( state ) {
	return config.isEnabled( 'tax11' )
		? 0.11
		: get( state, 'ui.payment.taxRate', null );
}
