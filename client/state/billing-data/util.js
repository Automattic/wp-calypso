/**
 * External dependencies
 */
import { assign } from 'lodash';
import { moment } from 'i18n-calypso';

/**
 * Parses the date within a transaction.
 * Returns a copy of the updated transaction.
 *
 * @param  {Object}  transaction  Transaction object
 * @return {Object}               Updated transaction with parsed date
 */
export const parseDate = ( transaction ) => {
	return assign( {}, transaction, {
		date: moment( transaction.date ).toDate()
	} );
};
