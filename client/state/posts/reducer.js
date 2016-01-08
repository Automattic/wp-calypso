/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import indexBy from 'lodash/collection/indexBy';

/**
 * Internal dependencies
 */
import {
	POST_RECEIVE,
	POSTS_RECEIVE,
} from 'state/action-types';

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

		case POSTS_RECEIVE:
			state = Object.assign( {}, state, indexBy( action.posts, 'global_ID' ) );
			break;
	}

	return state;
}
	}

	return state;
}

export default combineReducers( {
	items
} );
