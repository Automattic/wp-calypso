/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
	GUIDED_TRANSFER_STATUS_RECEIVE,
	GUIDED_TRANSFER_STATUS_REQUEST,
	GUIDED_TRANSFER_STATUS_REQUEST_FAILURE,
	GUIDED_TRANSFER_STATUS_REQUEST_SUCCESS,
} from 'state/action-types';
import { guidedTransferStatusSchema } from './schema';
import { createReducer } from 'state/utils';

// Stores the status of guided transfers per site
export const status = createReducer( {}, {
	[ GUIDED_TRANSFER_STATUS_RECEIVE ]: ( state, action ) =>
		( { ...state, [ action.siteId ]: action.guidedTransferStatus } )
}, guidedTransferStatusSchema );

// Tracks whether we're fetching the status of a guided transfer for a site
export const isFetching = createReducer( {}, {
	[ GUIDED_TRANSFER_STATUS_REQUEST ]: ( state, action ) =>
		( { ...state, [ action.siteId ]: true } ),

	[ GUIDED_TRANSFER_STATUS_REQUEST_SUCCESS ]: ( state, action ) =>
		( { ...state, [ action.siteId ]: false } ),

	[ GUIDED_TRANSFER_STATUS_REQUEST_FAILURE ]: ( state, action ) =>
		( { ...state, [ action.siteId ]: false } ),
} );

export default combineReducers( {
	isFetching,
	status,
} );
