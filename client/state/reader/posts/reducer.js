/* eslint-disable no-case-declarations */
/**
 * External dependencies
 */
import { keyBy, get, forEach } from 'lodash';

/**
 * Internal dependencies
 */
import {
	READER_POSTS_RECEIVE,
	READER_POST_SEEN,
	READER_SEEN_MARK_AS_SEEN_RECEIVE,
	READER_SEEN_MARK_AS_UNSEEN_RECEIVE,
	READER_SEEN_MARK_ALL_AS_SEEN_SECTION_RECEIVE,
	READER_SEEN_MARK_ALL_AS_SEEN_FEED_RECEIVE,
} from 'state/reader/action-types';
import { combineReducers } from 'state/utils';

/**
 * Tracks all known post objects, indexed by post ID.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export function items( state = {}, action ) {
	switch ( action.type ) {
		case READER_POSTS_RECEIVE:
			const posts = action.posts || action.payload.posts;
			return { ...state, ...keyBy( posts, 'global_ID' ) };

		case READER_SEEN_MARK_AS_SEEN_RECEIVE:
		case READER_SEEN_MARK_ALL_AS_SEEN_FEED_RECEIVE:
		case READER_SEEN_MARK_ALL_AS_SEEN_SECTION_RECEIVE:
			forEach( action.globalIds, ( globalId ) => {
				state[ globalId ] = { ...state[ globalId ], is_seen: true };
			} );
			return { ...state };

		case READER_SEEN_MARK_AS_UNSEEN_RECEIVE:
			forEach( action.globalIds, ( globalId ) => {
				state[ globalId ] = { ...state[ globalId ], is_seen: false };
			} );
			return { ...state };
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
// export const items = withSchemaValidation( itemsSchema, itemsReducer );

export default combineReducers( {
	items,
	seen,
} );
