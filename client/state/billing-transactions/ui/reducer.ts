import {
	BILLING_TRANSACTIONS_FILTER_SET_APP,
	BILLING_TRANSACTIONS_FILTER_SET_MONTH,
	BILLING_TRANSACTIONS_FILTER_SET_PAGE,
	BILLING_TRANSACTIONS_FILTER_SET_QUERY,
} from 'calypso/state/action-types';
import { combineReducers, keyedReducer } from 'calypso/state/utils';
import type { BillingTransactionUiState } from '../types';
import type { AnyAction } from 'redux';

/**
 * Returns the updated app filter state after an action has been dispatched
 */
export const app = ( state: BillingTransactionUiState[ 'app' ] = null, action: AnyAction ) => {
	if ( action.type === BILLING_TRANSACTIONS_FILTER_SET_APP ) {
		return action.app;
	}
	return state;
};

/**
 * Returns the updated date filter state after an action has been dispatched
 */
export const date = (
	state: BillingTransactionUiState[ 'date' ] = { month: null, operator: null },
	{ type, month, operator }: AnyAction
) => {
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
 */
export const page = ( state: BillingTransactionUiState[ 'page' ] = 1, action: AnyAction ) => {
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
 */
export const query = ( state: BillingTransactionUiState[ 'query' ] = '', action: AnyAction ) => {
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
