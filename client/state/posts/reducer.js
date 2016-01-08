/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import { POST_RECEIVE } from 'state/action-types';

/**
 * Tracks all known post objects, indexed by post global ID.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function items( state = {}, action ) {
	switch ( action.type ) {
		case POST_RECEIVE:
			state = Object.assign( {}, state, {
				[ action.post.global_ID ]: action.post
			} );
			break;
	}

	return state;
}

export default combineReducers( {
	items
} );
