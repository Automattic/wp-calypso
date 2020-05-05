/**
 * External dependencies
 */
import { getLocaleSlug } from 'i18n-calypso';
import { compact, flatMap, omit, slice, some, values } from 'lodash';
import moment from 'moment';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import getBillingTransactionsByType from 'state/selectors/get-billing-transactions-by-type';
import getBillingTransactionFilters from 'state/selectors/get-billing-transaction-filters';
import getCurrentLocaleSlug from 'state/selectors/get-current-locale-slug';

const PAGE_SIZE = 5;

/**
 * Utility function for formatting date for text search
 *
 * @param {Date} date date to be formatted
 * @returns {string}  formatted date
 */
function formatDate( date ) {
	const localeSlug = getLocaleSlug();
	return moment( date ).locale( localeSlug ).format( 'll' );
}

/**
 * Utility function extracting searchable strings from a single transaction
 *
 * @param {object}  transaction transaction object
 * @returns {Array}             list of searchable strings
 */
function getSearchableStrings( transaction ) {
	const rootStrings = values( omit( transaction, [ 'date', 'items' ] ) );
	const dateString = transaction.date ? formatDate( transaction.date ) : null;
	const itemStrings = flatMap( transaction.items, values );

	return compact( [ ...rootStrings, dateString, ...itemStrings ] );
}

/**
 * Utility function to search the transactions by the provided searchQuery
 *
 * @param {Array} transactions transactions to search
 * @param {string} searchQuery search query
 * @returns {Array}            search results
 */
function search( transactions, searchQuery ) {
	const needle = searchQuery.toLowerCase();

	return transactions.filter( ( transaction ) =>
		some( getSearchableStrings( transaction ), ( val ) => {
			const haystack = val.toString().toLowerCase();
			return haystack.includes( needle );
		} )
	);
}

/**
 * Returns the billing transactions filtered by the filters defined in state.billingTransactions.transactionFilters tree
 *
 * @param   {object}  state           Global state tree
 * @param   {string}  transactionType Transaction type
 * @returns {object}                  Filtered results in format {transactions, total, pageSize}
 */
export default createSelector(
	( state, transactionType ) => {
		const transactions = getBillingTransactionsByType( state, transactionType );
		if ( ! transactions ) {
			return {
				transactions,
				total: 0,
				pageSize: PAGE_SIZE,
			};
		}

		const { app, date, page, query } = getBillingTransactionFilters( state, transactionType );
		let results = query ? search( transactions, query ) : transactions;
		if ( date && date.month && date.operator ) {
			results = results.filter( ( transaction ) => {
				const transactionDate = moment( transaction.date );

				if ( 'equal' === date.operator ) {
					return transactionDate.isSame( date.month, 'month' );
				} else if ( 'before' === date.operator ) {
					return transactionDate.isBefore( date.month, 'month' );
				}
			} );
		}

		if ( app && app !== 'all' ) {
			results = results.filter( ( transaction ) => transaction.service === app );
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
	( state, transactionType ) => [
		// Since this selector allows for user-defined searches on localized dates, we need to
		// invalidate the cache whenever the user locale changes.
		// Ideally, we shouldn't allow for full-text search matching against localized dates.
		getCurrentLocaleSlug( state ),
		getBillingTransactionsByType( state, transactionType ),
		...values( getBillingTransactionFilters( state, transactionType ) ),
	]
);
