/**
 * Internal dependencies
 */
import {
	BILLING_TRANSACTIONS_FILTER_SET_APP,
	BILLING_TRANSACTIONS_FILTER_SET_MONTH,
	BILLING_TRANSACTIONS_FILTER_SET_PAGE,
	BILLING_TRANSACTIONS_FILTER_SET_QUERY,
} from 'calypso/state/action-types';

import 'calypso/state/billing-transactions/init';

/**
 * Sets the app filter on the given transactionType table
 *
 * @param {string} transactionType - transaction type: 'past' or 'upcoming'
 * @param {string} app - app filter value
 * @returns {object} action
 */
export const setApp = ( transactionType, app ) => ( {
	type: BILLING_TRANSACTIONS_FILTER_SET_APP,
	transactionType,
	app,
} );

/**
 * Sets the date filter value on the given transactionType table to show the transactions relative
 * to the given month
 *
 * @param {string} transactionType - transaction type: 'past' or 'upcoming'
 * @param {string} month - month in format 'YYYY-MM'
 * @param {string} operator - operator for the month. One of: equal, before
 * @returns {object} action
 */
export const setDate = ( transactionType, month, operator ) => ( {
	type: BILLING_TRANSACTIONS_FILTER_SET_MONTH,
	transactionType,
	month,
	operator,
} );

/**
 * Sets the page of the given transaction type table
 *
 * @param {string} transactionType - transaction type: 'past' or 'upcoming'
 * @param {number} page - page number, starting at 1
 * @returns {object} action
 */
export const setPage = ( transactionType, page ) => ( {
	type: BILLING_TRANSACTIONS_FILTER_SET_PAGE,
	transactionType,
	page,
} );

/**
 * Sets the search query by which to filter the transactions of the given type
 *
 * @param {string} transactionType - transaction type: 'past' or 'upcoming'
 * @param {string} query - string query
 * @returns {object} action
 */
export const setQuery = ( transactionType, query ) => ( {
	type: BILLING_TRANSACTIONS_FILTER_SET_QUERY,
	transactionType,
	query,
} );
