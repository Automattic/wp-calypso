/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
	READER_TAG_IMAGES_RECEIVE,
	SERIALIZE,
	DESERIALIZE,
} from 'state/action-types';

/**
 * Tracks all known image objects, indexed by tag name.
 *
 * @param  {Array} state  Current state
 * @param  {Object} action Action payload
 * @return {Array}        Updated state
 */
export function items( state = [], action ) {
	switch ( action.type ) {
		case READER_TAG_IMAGES_RECEIVE:
			return state.concat( action.images );

		// Always return default state - we don't want to serialize images yet
		case SERIALIZE:
		case DESERIALIZE:
			return [];
	}

	return state;
}

export default combineReducers( {
	items,
} );
