/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
	BILLING_DATA_RECEIVE,
	BILLING_DATA_REQUEST,
	BILLING_DATA_REQUEST_FAILURE,
	BILLING_DATA_REQUEST_SUCCESS
} from 'state/action-types';
import { billingDataItemsSchema } from './schema';
import { createReducer } from 'state/utils';

/**
 * Returns the updated items state after an action has been dispatched.
 * The state contains all past and upcoming billing data entries.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export const items = createReducer( {}, {
	[ BILLING_DATA_RECEIVE ]: ( state, { past, upcoming } ) => ( { ...state, past, upcoming } ),
}, billingDataItemsSchema );

/**
 * Returns the updated requests state after an action has been dispatched.
 * The state contains whether a request for billing data is in progress.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export const requesting = createReducer( false, {
	[ BILLING_DATA_REQUEST ]: () => true,
	[ BILLING_DATA_REQUEST_FAILURE ]: () => false,
	[ BILLING_DATA_REQUEST_SUCCESS ]: () => false,
} );

export default combineReducers( {
	items,
	requesting,
} );
