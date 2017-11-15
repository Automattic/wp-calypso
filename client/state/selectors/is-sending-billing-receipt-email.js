/** @format */

/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Returns true if we are currently making a request to send a certain receipt email. False otherwise.
 * Returns null if the receipt ID is unknown, or there is no information yet.
 *
 * @param  {Object}  state       Global state tree
 * @param  {Number}  receiptId   The ID of the receipt we're querying
 * @return {?Boolean}            Whether email is being sent for that receipt
 */
export default function isSendingBillingReceiptEmail( state, receiptId ) {
	return get( state, [ 'billingTransactions', 'sendingReceiptEmail', receiptId ], null );
}
