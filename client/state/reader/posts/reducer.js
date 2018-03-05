/** @format */
/**
 * External dependencies
 */
import { keyBy, get } from 'lodash';

/**
 * Internal dependencies
 */
import { READER_POSTS_RECEIVE, READER_POST_SEEN } from 'state/action-types';
import { combineReducers } from 'state/utils';

/**
 * Tracks all known post objects, indexed by post ID.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function items( state = {}, action ) {
	switch ( action.type ) {
		case READER_POSTS_RECEIVE: {
			return { ...state, ...keyBy( action.posts, 'global_ID' ) };
		}
	}
	return state;
}
export function seen( state = {}, action ) {
	const id = get( action, 'payload.post.global_ID' );

	if ( action.type === READER_POST_SEEN && id ) {
		return { ...state, [ id ]: true };
	}

	return state;
}
// @TODO: evaluate serialization later
// import { itemsSchema } from './schema';
// items.schema = itemsSchema;

export default combineReducers( {
	items,
	seen,
} );
