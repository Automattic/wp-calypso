/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
	EDITOR_POST_EDIT,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';

/**
 * Returns the updated editor posts state after an action has been dispatched.
 * The state maps site ID, post ID pairing to an object containing revisions
 * for the post.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function posts( state = {}, action ) {
	switch ( action.type ) {
		case EDITOR_POST_EDIT:
			const { post, siteId, postId = '' } = action;
			state = Object.assign( {}, state, {
				[ siteId ]: Object.assign( {}, state[ siteId ] )
			} );

			state[ siteId ][ postId ] = Object.assign( {}, state[ siteId ][ postId ], post );
			return state;

		case SERIALIZE:
		case DESERIALIZE:
			return {};
	}

	return state;
}

export default combineReducers( {
	posts
} );
