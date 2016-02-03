/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
	READER_SIDEBAR_LISTS_TOGGLE,
	READER_SIDEBAR_TAGS_TOGGLE,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';

export function isListsOpen( state = false, action ) {
	switch ( action.type ) {
		case READER_SIDEBAR_LISTS_TOGGLE:
			return ! state;
		case SERIALIZE:
			return false;
		case DESERIALIZE:
			return false;
	}

	return state;
}

export function isTagsOpen( state = false, action ) {
	switch ( action.type ) {
		case READER_SIDEBAR_TAGS_TOGGLE:
			return ! state;
		case SERIALIZE:
			return false;
		case DESERIALIZE:
			return false;
	}

	return state;
}

export default combineReducers( {
	isListsOpen,
	isTagsOpen
} );
