/**
 * Internal dependencies
 */
import { READER_SEEN_UNSEEN_STATUS_ALL_RECEIVE } from 'state/reader/action-types';
import { SERIALIZE } from 'state/action-types';
import { combineReducers } from 'state/utils';

/**
 * Reader Unseen status for all sections
 *
 * @param state redux state
 * @param action redux action
 * @returns {{}|*} redux state
 */
export function unseenStatus( state = {}, action ) {
	switch ( action.type ) {
		case READER_SEEN_UNSEEN_STATUS_ALL_RECEIVE:
			return action.sections;

		case SERIALIZE:
			return {};
	}
	return state;
}

export default combineReducers( {
	unseenStatus,
} );
