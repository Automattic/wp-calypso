/** @format */
/**
 * External dependencies
 */
import { moment } from 'i18n-calypso';
import { flatten, isDate, omit, slice, some, values, without } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import getPastBillingTransactions from './get-past-billing-transactions';
import getUpcomingBillingTransactions from './get-upcoming-billing-transactions';
import getBillingTransactionFilters from './get-billing-transaction-filters';

const PAGE_SIZE = 5;

/**
 * Utility function for formatting date for text search
 * @param {Date} date date to be formatted
 * @returns {String}  formatted date
 */
const formatDate = date => {
	return moment( date ).format( 'll' );
};

/**
 * Utility function extracting searchable strings from a single transaction
 * @param {Object}  transaction transaction object
 * @returns {Array}             list of searchable strings
 */
const getSearchableStrings = transaction => {
	const rootStrings = values( omit( transaction, 'items' ) ),
		transactionItems = transaction.items || [],
		itemStrings = flatten( transactionItems.map( values ) );

	return without( rootStrings.concat( itemStrings ), null, undefined );
};

/**
 * Utility function to search the transactions by the provided searchQuery
 * @param {Array} transactions transactions to search
 * @param {String} searchQuery search query
 * @returns {Array}            search result
 */
const search = ( transactions, searchQuery ) => {
	return transactions.filter( function( transaction ) {
		return some( getSearchableStrings( transaction ), function( val ) {
			if ( isDate( val ) ) {
				val = formatDate( val );
			}

			const haystack = val.toString().toLowerCase();
			const needle = searchQuery.toLowerCase();

			return haystack.indexOf( needle ) !== -1;
		} );
	} );
};

/**
 * Returns the billing transactions filtered by the filters defined in state.billingTransactions.transactionFilters tree
 *
 * @param  {Object}  state           Global state tree
 * @param  {String}  transactionType Transaction type
 * @return {Object}                  Filtered results in format {transactions, total, pageSize}
 */
export default createSelector(
	( state, transactionType ) => {
		const transactions =
			'upcoming' === transactionType
				? getUpcomingBillingTransactions( state )
				: getPastBillingTransactions( state );
		if ( ! transactions ) {
			return {
				transactions,
				total: 0,
				pageSize: PAGE_SIZE,
			};
		}

		const { app, date, page, query } = getBillingTransactionFilters( state, transactionType );
		let results = search( transactions, query );
		if ( date && date.month && date.operator ) {
			results = results.filter( function( transaction ) {
				const transactionDate = moment( transaction.date );

				if ( 'equal' === date.operator ) {
					return transactionDate.isSame( date.month, 'month' );
				} else if ( 'before' === date.operator ) {
					return transactionDate.isBefore( date.month, 'month' );
				}
			} );
		}

		if ( app && app !== 'all' ) {
			results = results.filter( function( transaction ) {
				return transaction.service === app;
			} );
		}

		const total = results.length;

		const pageIndex = page - 1;
		results = slice( results, pageIndex * PAGE_SIZE, pageIndex * PAGE_SIZE + PAGE_SIZE );

		return {
			transactions: results,
			total,
			pageSize: PAGE_SIZE,
		};
	},
	( state, transactionType ) => {
		const filters = getBillingTransactionFilters( state, transactionType );

		return [
			'upcoming' === transactionType
				? getUpcomingBillingTransactions( state )
				: getPastBillingTransactions( state ),
			filters.app,
			filters.date,
			filters.page,
			filters.query,
		];
	}
);
