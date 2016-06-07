/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import keyBy from 'lodash/keyBy';
import omitBy from 'lodash/omitBy';
import isUndefined from 'lodash/isUndefined';

/**
 * Internal dependencies
 */
import {
	READER_POSTS_RECEIVE,
	SERIALIZE,
	DESERIALIZE,
} from 'state/action-types';
import { itemsSchema } from './schema';
import { isValidStateWithSchema } from 'state/utils';

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
		case SERIALIZE:
			return state;
		case DESERIALIZE:
			if ( ! isValidStateWithSchema( state, itemsSchema ) ) {
				return {};
			}
			return state;
	}
	return state;
}

export default combineReducers( {
	items
} );
