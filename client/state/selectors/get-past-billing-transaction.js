/** @format */

/**
 * External dependencies
 */

import { find, get, keys } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import getPastBillingTransactions from './get-past-billing-transactions';

/**
 * Returns a past billing transaction.
 * Returns null if the billing transactions have not been fetched yet, or there is no transaction with that ID.
 *
 * @param  {Object}  state   Global state tree
 * @param  {String}  id      ID of the transaction
 * @return {?Object}         The transaction object
 */
const getPastBillingTransaction = createSelector(
	( state, id ) => {
		return (
			find( getPastBillingTransactions( state ), { id } ) ||
			get( state, [ 'billingTransactions', 'individualTransactions', 'receipts', id ], null )
		);
	},
	state => [
		getPastBillingTransactions( state ),
		...keys( get( state, [ 'billingTransactions', 'individualTransactions', 'receipts' ] ) ),
	]
);

export default getPastBillingTransaction;
