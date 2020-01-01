/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Returns true if we are currently making a request to get the billing transactions.
 * False otherwise.
 *
 * @param  {object}   state  Global state tree
 * @return {boolean}         Whether the billing transactions are being requested
 */
export default function isRequestingBillingTransactions( state ) {
	return get( state, 'billingTransactions.requesting', false );
}
