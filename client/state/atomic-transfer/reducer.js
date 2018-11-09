/** @format */

/**
 * Internal dependencies
 */
import { combineReducers, keyedReducer, createReducer } from 'state/utils';
import { atomicTransfer as schema } from './schema';
import {
	ATOMIC_TRANSFER_REQUEST as TRANSFER_REQUEST,
	ATOMIC_TRANSFER_REQUEST_FAILURE as TRANSFER_REQUEST_FAILURE,
	ATOMIC_TRANSFER_SET as SET_TRANSFER,
} from 'state/action-types';

export const atomicTransfer = createReducer(
	{},
	{
		[ SET_TRANSFER ]: ( state, { transfer } ) => ( { ...state, ...transfer } ),
	},
	schema
);

export const fetchingTransfer = createReducer( false, {
	[ TRANSFER_REQUEST ]: () => true,
	[ TRANSFER_REQUEST_FAILURE ]: () => false,
} );

export const atomicTransferReducers = combineReducers( {
	atomicTransfer,
	fetchingTransfer,
} );

export default keyedReducer( 'siteId', atomicTransferReducers );
