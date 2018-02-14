/** @format */

/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { isRequestingBillingTransactions } from 'state/selectors';

/**
 * Returns true if we are currently making a request to get the billing transactions.
 * False otherwise.
 *
 * @param  {Object}   state         Global state tree
 * @param  {Number}   transactionId ID of the requested transaction
 * @return {Boolean}                Whether a billing transaction is being requested
 */
export default function isRequestingBillingTransaction( state, transactionId ) {
	return (
		isRequestingBillingTransactions( state ) ||
		get(
			state,
			[ 'billingTransactions', 'individualTransactions', 'requesting', transactionId ],
			false
		)
	);
}
