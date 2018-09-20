/** @format */

/**
 * Internal dependencies
 */
import {
	BILLING_TRANSACTION_ERROR_CLEAR,
	BILLING_TRANSACTION_RECEIVE,
	BILLING_TRANSACTION_REQUEST,
	BILLING_TRANSACTION_REQUEST_FAILURE,
	BILLING_TRANSACTION_REQUEST_SUCCESS,
} from 'state/action-types';
import { combineReducers, createReducer, keyedReducer } from 'state/utils';

/**
 * Returns the updated requests state after an action has been dispatched.
 * The state is a Boolean - true if a transaction is being requested
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Boolean}        Updated state
 */
export const requesting = createReducer( false, {
	[ BILLING_TRANSACTION_REQUEST ]: () => true,
	[ BILLING_TRANSACTION_REQUEST_FAILURE ]: () => false,
	[ BILLING_TRANSACTION_REQUEST_SUCCESS ]: () => false,
} );

/**
 * Returns the updated error state after an action has been dispatched.
 * The state is a Boolean - true if a transaction request has failed
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Boolean}        Updated state
 */
export const error = createReducer( false, {
	[ BILLING_TRANSACTION_REQUEST_FAILURE ]: () => true,
	[ BILLING_TRANSACTION_REQUEST_SUCCESS ]: () => false,
	[ BILLING_TRANSACTION_ERROR_CLEAR ]: () => false,
} );

/**
 * Returns the updated data state after an action has been dispatched.
 * The state contains the transaction data after a successful fetch
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export const data = createReducer( null, {
	[ BILLING_TRANSACTION_RECEIVE ]: ( state, { receipt } ) => receipt,
} );

export default keyedReducer(
	'transactionId',
	combineReducers( {
		requesting,
		error,
		data,
	} )
);
