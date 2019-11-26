/**
 * Internal dependencies
 */
import { combineReducers, withoutPersistence } from 'state/utils';
import {
	REWIND_BACKUPS_RECEIVE,
	REWIND_BACKUPS_REQUEST,
	REWIND_BACKUPS_REQUEST_FAILURE,
	REWIND_BACKUPS_REQUEST_SUCCESS,
} from 'state/action-types';

/**
 * Returns the updated requests state after an action has been dispatched. The
 * state maps site ID to whether a request is in progress.
 *
 * @param   {object} state  Current state
 * @param   {object} action Action payload
 * @returns {object}        Updated state
 */
export const requesting = withoutPersistence( ( state = {}, { type } ) => {
	switch ( type ) {
		case REWIND_BACKUPS_REQUEST: {
			return true;
		}
		case REWIND_BACKUPS_REQUEST_SUCCESS:
		case REWIND_BACKUPS_REQUEST_FAILURE: {
			return false;
		}
	}

	return state;
} );

/**
 * Returns the updated items state after an action has been dispatched. The
 * state maps site ID to the rewind backups object.
 *
 * @param   {object} state  Current state
 * @param   {object} action Action payload
 * @returns {object}        Updated state
 */
export const items = ( state = {}, { type, backups } ) =>
	type === REWIND_BACKUPS_RECEIVE ? backups : state;

export default combineReducers( {
	items,
	requesting,
} );
