/**
 * External dependencies
 */
import { assign } from 'lodash';

/**
 * Parses the date within a transaction.
 * Returns a copy of the updated transaction.
 *
 * @param  {Object}  transaction  Transaction object
 * @return {Object}               Updated transaction with date converted from string to a Date object.
 */
export const parseTransactionDate = ( transaction ) => {
	return assign( {}, transaction, {
		date: new Date( transaction.date )
	} );
};
