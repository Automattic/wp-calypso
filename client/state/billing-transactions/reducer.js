/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
	BILLING_RECEIPT_EMAIL_SEND,
	BILLING_RECEIPT_EMAIL_SEND_FAILURE,
	BILLING_RECEIPT_EMAIL_SEND_SUCCESS,
	BILLING_TRANSACTIONS_RECEIVE,
	BILLING_TRANSACTIONS_REQUEST,
	BILLING_TRANSACTIONS_REQUEST_FAILURE,
	BILLING_TRANSACTIONS_REQUEST_SUCCESS
} from 'state/action-types';
import { billingTransactionsSchema } from './schema';
import { createReducer } from 'state/utils';

/**
 * Returns the updated items state after an action has been dispatched.
 * The state contains all past and upcoming billing transactions.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export const items = createReducer( {}, {
	[ BILLING_TRANSACTIONS_RECEIVE ]: ( state, { past, upcoming } ) => ( { past, upcoming } ),
}, billingTransactionsSchema );

/**
 * Returns the updated requests state after an action has been dispatched.
 * The state contains whether a request for billing transactions is in progress.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export const requesting = createReducer( false, {
	[ BILLING_TRANSACTIONS_REQUEST ]: () => true,
	[ BILLING_TRANSACTIONS_REQUEST_FAILURE ]: () => false,
	[ BILLING_TRANSACTIONS_REQUEST_SUCCESS ]: () => false,
} );

/**
 * Returns the updated sending email requests state after an action has been dispatched.
 * The state contains whether a request for sending a receipt email is in progress.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export const sendingReceiptEmail = createReducer( {}, {
	[ BILLING_RECEIPT_EMAIL_SEND ]: ( state, { receiptId } ) => ( { ...state, [ receiptId ]: true } ),
	[ BILLING_RECEIPT_EMAIL_SEND_FAILURE ]: ( state, { receiptId } ) => ( { ...state, [ receiptId ]: false } ),
	[ BILLING_RECEIPT_EMAIL_SEND_SUCCESS ]: ( state, { receiptId } ) => ( { ...state, [ receiptId ]: false } ),
} );

export default combineReducers( {
	items,
	requesting,
	sendingReceiptEmail,
} );
