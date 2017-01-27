/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import { union, without } from 'lodash';
/**
 * Internal dependencies
 */
import {
	READER_FOLLOW,
	READER_UNFOLLOW,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';

/**
 * Tracks all known list objects, indexed by list ID.
 *
 * @param  {Array} state  Current state
 * @param  {Object} action Action payload
 * @return {Array}        Updated state
 */
export function items( state = [], action ) {
	switch ( action.type ) {
		case READER_FOLLOW:
			return union( state, [ action.url ] );

		case READER_UNFOLLOW:
			return without( state, action.url );

		case SERIALIZE:
		case DESERIALIZE:
			return [];
	}

	return state;
}

export default combineReducers( {
	items
} );
