/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import { READER_SIDEBAR_LISTS_TOGGLE, READER_SIDEBAR_TAGS_TOGGLE } from 'state/action-types';

function isListsOpen( state = false, action ) {
	switch ( action.type ) {
		case READER_SIDEBAR_LISTS_TOGGLE:
			state = ! state;
			break;
	}

	return state;
}

function isTagsOpen( state = false, action ) {
	switch ( action.type ) {
		case READER_SIDEBAR_TAGS_TOGGLE:
			state = ! state;
			break;
	}

	return state;
}

export default combineReducers( {
	isListsOpen,
	isTagsOpen
} );
