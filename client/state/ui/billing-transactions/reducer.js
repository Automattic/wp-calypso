/** @format */
/**
 * Internal dependencies
 */
import {
	BILLING_TRANSACTIONS_FILTER_SET_APP,
	BILLING_TRANSACTIONS_FILTER_SET_MONTH,
	BILLING_TRANSACTIONS_FILTER_SET_NEWEST,
	BILLING_TRANSACTIONS_FILTER_SET_PAGE,
	BILLING_TRANSACTIONS_FILTER_SET_QUERY,
} from 'state/action-types';
import { combineReducers, createReducer, keyedReducer } from 'state/utils';

/**
 * Returns the updated app filter state after an action has been dispatched
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {String}        Updated state
 */
export const app = createReducer( null, {
	[ BILLING_TRANSACTIONS_FILTER_SET_APP ]: ( state, action ) => action.app,
} );

/**
 * Returns the updated date filter state after an action has been dispatched
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export const date = createReducer( null, {
	[ BILLING_TRANSACTIONS_FILTER_SET_NEWEST ]: () => null,
	[ BILLING_TRANSACTIONS_FILTER_SET_MONTH ]: ( state, { month, operator } ) => ( {
		month,
		operator,
	} ),
} );

/**
 * Returns the updated page state after an action has been dispatched
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Number}        Updated state
 */
export const page = createReducer( 1, {
	[ BILLING_TRANSACTIONS_FILTER_SET_APP ]: () => 1,
	[ BILLING_TRANSACTIONS_FILTER_SET_MONTH ]: () => 1,
	[ BILLING_TRANSACTIONS_FILTER_SET_NEWEST ]: () => 1,
	[ BILLING_TRANSACTIONS_FILTER_SET_PAGE ]: ( state, action ) => action.page,
	[ BILLING_TRANSACTIONS_FILTER_SET_QUERY ]: () => 1,
} );

/**
 * Returns the updated string search filter state after an action has been dispatched
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {String}        Updated state
 */
export const query = createReducer( '', {
	[ BILLING_TRANSACTIONS_FILTER_SET_QUERY ]: ( state, action ) => action.query,
} );

export default keyedReducer(
	'transactionType',
	combineReducers( {
		app,
		date,
		page,
		query,
	} )
);
