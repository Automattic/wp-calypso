/**
 * Internal dependencies
 */
import {
	BILLING_TRANSACTION_ERROR_CLEAR,
	BILLING_TRANSACTION_RECEIVE,
	BILLING_TRANSACTION_REQUEST,
	BILLING_TRANSACTION_REQUEST_FAILURE,
	BILLING_TRANSACTION_REQUEST_SUCCESS,
} from 'calypso/state/action-types';
import { combineReducers, keyedReducer, withoutPersistence } from 'calypso/state/utils';

/**
 * Returns the updated requests state after an action has been dispatched.
 * The state is a Boolean - true if a transaction is being requested
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {boolean}        Updated state
 */
export const requesting = withoutPersistence( ( state = false, action ) => {
	switch ( action.type ) {
		case BILLING_TRANSACTION_REQUEST:
			return true;
		case BILLING_TRANSACTION_REQUEST_FAILURE:
			return false;
		case BILLING_TRANSACTION_REQUEST_SUCCESS:
			return false;
	}

	return state;
} );

/**
 * Returns the updated error state after an action has been dispatched.
 * The state is a Boolean - true if a transaction request has failed
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {boolean}        Updated state
 */
export const error = withoutPersistence( ( state = false, action ) => {
	switch ( action.type ) {
		case BILLING_TRANSACTION_REQUEST_FAILURE:
			return true;
		case BILLING_TRANSACTION_REQUEST_SUCCESS:
			return false;
		case BILLING_TRANSACTION_ERROR_CLEAR:
			return false;
	}

	return state;
} );

/**
 * Returns the updated data state after an action has been dispatched.
 * The state contains the transaction data after a successful fetch
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export const data = withoutPersistence( ( state = null, action ) => {
	switch ( action.type ) {
		case BILLING_TRANSACTION_RECEIVE: {
			const { receipt } = action;
			return receipt;
		}
	}

	return state;
} );

export default keyedReducer(
	'transactionId',
	combineReducers( {
		requesting,
		error,
		data,
	} )
);
