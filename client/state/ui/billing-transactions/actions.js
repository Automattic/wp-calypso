/** @format */
/**
 * Internal dependencies
 */
import {
	BILLING_TRANSACTIONS_FILTER_SET_APP,
	BILLING_TRANSACTIONS_FILTER_SET_MONTH,
	BILLING_TRANSACTIONS_FILTER_SET_PAGE,
	BILLING_TRANSACTIONS_FILTER_SET_QUERY,
} from 'state/action-types';

/**
 * Sets the app filter on the given transactionType table
 * @param {String} transactionType - transaction type: 'past' or 'upcoming'
 * @param {String} app - app filter value
 * @returns {Object} action
 */
export const setApp = ( transactionType, app ) => ( {
	type: BILLING_TRANSACTIONS_FILTER_SET_APP,
	transactionType,
	app,
} );

/**
 * Sets the date filter value on the given transactionType table to show the transactions relative
 * to the given month
 * @param {String} transactionType - transaction type: 'past' or 'upcoming'
 * @param {String} month - month in format 'YYYY-MM'
 * @param {String} operator - operator for the month. One of: equal, before
 * @returns {Object} action
 */
export const setDate = ( transactionType, month, operator ) => ( {
	type: BILLING_TRANSACTIONS_FILTER_SET_MONTH,
	transactionType,
	month,
	operator,
} );

/**
 * Sets the page of the given transaction type table
 * @param {String} transactionType - transaction type: 'past' or 'upcoming'
 * @param {Number} page - page number, starting at 1
 * @returns {Object} action
 */
export const setPage = ( transactionType, page ) => ( {
	type: BILLING_TRANSACTIONS_FILTER_SET_PAGE,
	transactionType,
	page,
} );

/**
 * Sets the search query by which to filter the transactions of the given type
 * @param {String} transactionType - transaction type: 'past' or 'upcoming'
 * @param {String} query - string query
 * @returns {Object} action
 */
export const setQuery = ( transactionType, query ) => ( {
	type: BILLING_TRANSACTIONS_FILTER_SET_QUERY,
	transactionType,
	query,
} );
