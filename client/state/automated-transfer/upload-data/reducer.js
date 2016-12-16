/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
	AUTOMATED_TRANSFER_UPLOAD as UPLOAD,
	AUTOMATED_TRANSFER_UPLOAD_UPDATE as UPDATE,
} from 'state/action-types';

/**
 * How many bytes of the currently uploading file have already been received
 *
 * @param {number} state byte count
 * @param {object} action Redux action
 * @returns {number} new byte count
 */
export const bytesLoaded = ( state = 0, action ) =>
	UPDATE === action.type
		? action.bytesLoaded
		: state;

/**
 * How many total bytes belong to the currently uploading file.
 *
 * @param {number} state byte count
 * @param {object} action Redux action
 * @returns {number} new byte count
 */
export const bytesTotal = ( state = 0, action ) =>
	UPLOAD === action.type
		? action.bytesTotal
		: state;

export const updateData = combineReducers( {
	bytesLoaded,
	bytesTotal,
} );

export const updateReducer = updatePredicate => ( state = {}, action ) =>
	updatePredicate( state, action )
		? updateData( state, action )
		: state;

export default updateReducer;
