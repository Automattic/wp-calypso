/** @format */

/**
 * Internal dependencies
 */
import getPastBillingTransactions from 'state/selectors/get-past-billing-transactions';
import getUpcomingBillingTransactions from 'state/selectors/get-upcoming-billing-transactions';

/**
 * Returns billing transactions of the provided type.
 * Returns null if the billing transactions have not been fetched yet.
 *
 * @param  {Object}  state           Global state tree
 * @param  {String}  transactionType Type of transactions to retrieve
 * @return {?Array}                  An array of past transactions
 */
export default ( state, transactionType ) =>
	'upcoming' === transactionType
		? getUpcomingBillingTransactions( state )
		: getPastBillingTransactions( state );
