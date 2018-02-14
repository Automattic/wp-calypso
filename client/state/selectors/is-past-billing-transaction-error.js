/** @format */

/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Returns a past billing transaction.
 * Returns null if the billing transactions have not been fetched yet, or there is no transaction with that ID.
 *
 * @param  {Object}  state   Global state tree
 * @param  {String}  id      ID of the transaction
 * @return {?Object}         The transaction object
 */
const isPastBillingTransactionError = ( state, id ) => {
	return get( state, [ 'billingTransactions', 'individualTransactions', 'errors', id ], false );
};

export default isPastBillingTransactionError;
