/**
 * External dependencies
 */

import { find, get } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import getPastBillingTransactions from 'state/selectors/get-past-billing-transactions';

/**
 * Utility function to retrieve a transaction from individualTransactions state subtree
 *
 * @param  {Object}  state   Global state tree
 * @param  {Number}  id      ID of the transaction
 * @return {?Object}         The transaction object or null if it doesn't exist
 */
const getIndividualBillingTransaction = ( state, id ) =>
	get( state, [ 'billingTransactions', 'individualTransactions', id, 'data' ], null );

/**
 * Returns a past billing transaction.
 * Looks for the transaction in the most recent billing transactions and then looks for individually-fetched transactions
 * Returns null if the billing transactions have not been fetched yet, or there is no transaction with that ID.
 *
 * @param  {Object}  state   Global state tree
 * @param  {Number}  id      ID of the transaction
 * @return {?Object}         The transaction object
 */
export default createSelector(
	( state, id ) =>
		find( getPastBillingTransactions( state ), { id } ) ||
		getIndividualBillingTransaction( state, id ),
	( state, id ) => [
		getPastBillingTransactions( state ),
		getIndividualBillingTransaction( state, id ),
	]
);
