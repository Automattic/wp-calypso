/**
 * Internal dependencies
 */
import {
	BILLING_TRANSACTIONS_FILTER_SET_APP,
	BILLING_TRANSACTIONS_FILTER_SET_MONTH,
	BILLING_TRANSACTIONS_FILTER_SET_PAGE,
	BILLING_TRANSACTIONS_FILTER_SET_QUERY,
} from 'calypso/state/action-types';
import { combineReducers, keyedReducer } from 'calypso/state/utils';

/**
 * Returns the updated app filter state after an action has been dispatched
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {string}        Updated state
 */
export const app = ( state = null, action ) => {
	if ( action.type === BILLING_TRANSACTIONS_FILTER_SET_APP ) {
		return action.app;
	}
	return state;
};

/**
 * Returns the updated date filter state after an action has been dispatched
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export const date = ( state = { month: null, operator: null }, { type, month, operator } ) => {
	if ( type === BILLING_TRANSACTIONS_FILTER_SET_MONTH ) {
		return {
			month,
			operator,
		};
	}
	return state;
};

/**
 * Returns the updated page state after an action has been dispatched
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {number}        Updated state
 */
export const page = ( state = 1, action ) => {
	switch ( action.type ) {
		case BILLING_TRANSACTIONS_FILTER_SET_PAGE:
			return action.page;
		case BILLING_TRANSACTIONS_FILTER_SET_APP:
		case BILLING_TRANSACTIONS_FILTER_SET_MONTH:
		case BILLING_TRANSACTIONS_FILTER_SET_QUERY:
			return 1;
		default:
			return state;
	}
};

/**
 * Returns the updated string search filter state after an action has been dispatched
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {string}        Updated state
 */
export const query = ( state = '', action ) => {
	if ( action.type === BILLING_TRANSACTIONS_FILTER_SET_QUERY ) {
		return action.query;
	}
	return state;
};

export default keyedReducer(
	'transactionType',
	combineReducers( {
		app,
		date,
		page,
		query,
	} )
);
