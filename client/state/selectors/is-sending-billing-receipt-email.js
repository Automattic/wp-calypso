/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/billing-transactions/init';

/**
 * Returns true if we are currently making a request to send a certain receipt email. False otherwise.
 * Returns null if the receipt ID is unknown, or there is no information yet.
 *
 * @param  {object}  state       Global state tree
 * @param  {number}  receiptId   The ID of the receipt we're querying
 * @returns {?boolean}            Whether email is being sent for that receipt
 */
export default function isSendingBillingReceiptEmail( state, receiptId ) {
	return get( state, [ 'billingTransactions', 'sendingReceiptEmail', receiptId ], null );
}
