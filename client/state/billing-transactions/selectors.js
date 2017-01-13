/**
 * External dependencies
 */
import { get, find, mapValues } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { parseTransactionDate } from './util';

/**
 * Returns true if we are currently making a request to get the billing transactions.
 * False otherwise.
 *
 * @param  {Object}    state  Global state tree
 * @return {Boolean}          Whether the billing transactions are being requested
 */
export function isRequestingBillingTransactions( state ) {
	return get( state, 'billingTransactions.requesting', false );
}

/**
 * Returns all billing transactions.
 * Returns null if the billing transactions have not been fetched yet.
 *
 * @param  {Object}  state   Global state tree
 * @return {?Object}         Billing transactions
 */
export const getBillingTransactions = createSelector(
	( state ) => {
		const allTransactions = get( state, 'billingTransactions.items', null );
		if ( ! allTransactions ) {
			return null;
		}

		return mapValues( allTransactions, transactions => transactions.map( parseTransactionDate ) );
	}
);

/**
 * Returns a past billing transaction.
 * Returns null if the billing transactions have not been fetched yet, or there is no transaction with that ID.
 *
 * @param  {Object}  state   Global state tree
 * @param  {String}  id      ID of the transaction
 * @return {?Object}         The transaction object
 */
export const getPastBillingTransaction = createSelector(
	( state, id ) => {
		const pastTransactions = get( getBillingTransactions( state ), [ 'past' ], null );
		if ( ! pastTransactions ) {
			return null;
		}

		return find( pastTransactions, { id } ) || null;
	},
	getBillingTransactions
);
