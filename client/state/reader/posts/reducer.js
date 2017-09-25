/** @format */
/**
 * External dependencies
 */
import { keyBy } from 'lodash';

/**
 * Internal dependencies
 */
import { itemsSchema } from './schema';
import { READER_POSTS_RECEIVE } from 'state/action-types';
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
			return Object.assign( {}, state, keyBy( action.posts, 'global_ID' ) );
		}
	}
	return state;
}
items.schema = itemsSchema;

export default combineReducers( {
	items,
} );
