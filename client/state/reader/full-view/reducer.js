/**
 * Internal dependencies
 */
import { READER_FULL_VIEW_POST_KEY_SET } from 'state/reader/action-types';
import { SERIALIZE } from 'state/action-types';
import { combineReducers } from 'state/utils';

/**
 * Tracks the post key of the currently full viewed post
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export function fullViewPostKey( state = null, action ) {
	switch ( action.type ) {
		case READER_FULL_VIEW_POST_KEY_SET:
			return action.postKey;

		case SERIALIZE:
			return null;
	}
	return state;
}

export default combineReducers( {
	fullViewPostKey,
} );
