/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import { AUTOMATED_TRANSFER_STATUS_SET } from 'state/action-types';
import { automatedTransferStatusSchema } from './schema';
import { createReducer } from 'state/utils';

// Stores the status of automated transfers per site
export const status = createReducer( {}, {
	[ AUTOMATED_TRANSFER_STATUS_SET ]: ( state, action ) => ( {
		...state,
		[ action.siteId ]: action.automatedTransferStatus,
	} ),
}, automatedTransferStatusSchema );

export default combineReducers( {
	status,
} );
