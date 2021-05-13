/**
 * Internal dependencies
 */
import 'calypso/state/billing-transactions/init';

/**
 * Returns all billing transactions.
 * Returns null if the billing transactions have not been fetched yet.
 *
 * @param   {object}  state   Global state tree
 * @returns {object}         Billing transactions
 */
export default function getBillingTransactions( state ) {
	return state.billingTransactions.items;
}
