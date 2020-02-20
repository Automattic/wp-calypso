/**
 * Internal dependencies
 */
import getPastBillingTransactions from 'state/selectors/get-past-billing-transactions';
import getUpcomingBillingTransactions from 'state/selectors/get-upcoming-billing-transactions';

/**
 * Returns billing transactions of the provided type.
 * Returns null if the billing transactions have not been fetched yet.
 *
 * @param  {object}  state           Global state tree
 * @param  {string}  transactionType Type of transactions to retrieve
 * @returns {?Array}                  An array of past transactions
 */
export default ( state, transactionType ) =>
	'upcoming' === transactionType
		? getUpcomingBillingTransactions( state )
		: getPastBillingTransactions( state );
