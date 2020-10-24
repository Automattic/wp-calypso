/**
 * External dependencies
 */
import { find, get } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'calypso/lib/create-selector';
import getPastBillingTransactions from 'calypso/state/selectors/get-past-billing-transactions';

import 'calypso/state/billing-transactions/init';

/**
 * Utility function to retrieve a transaction from individualTransactions state subtree
 *
 * @param  {object}  state   Global state tree
 * @param  {number}  id      ID of the transaction
 * @returns {?object}         The transaction object or null if it doesn't exist
 */
const getIndividualBillingTransaction = ( state, id ) =>
	get( state, [ 'billingTransactions', 'individualTransactions', id, 'data' ], null );

/**
 * Returns a past billing transaction.
 * Looks for the transaction in the most recent billing transactions and then looks for individually-fetched transactions
 * Returns null if the billing transactions have not been fetched yet, or there is no transaction with that ID.
 *
 * @param  {object}  state   Global state tree
 * @param  {number}  id      ID of the transaction
 * @returns {?object}         The transaction object
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
