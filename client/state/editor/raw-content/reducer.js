/**
 * Internal dependencies
 */
import {
	EDITOR_RESET,
	EDITOR_RESET_RAW_CONTENT,
	EDITOR_EDIT_RAW_CONTENT,
} from 'calypso/state/action-types';
import { combineReducers } from 'calypso/state/utils';

const initial = ( state = null, action ) => {
	switch ( action.type ) {
		case EDITOR_RESET:
		case EDITOR_RESET_RAW_CONTENT:
			return null;
		case EDITOR_EDIT_RAW_CONTENT:
			if ( state === null ) {
				return action.content;
			}
	}
	return state;
};

const current = ( state = null, action ) => {
	switch ( action.type ) {
		case EDITOR_RESET:
		case EDITOR_RESET_RAW_CONTENT:
			return null;
		case EDITOR_EDIT_RAW_CONTENT:
			return action.content;
	}
	return state;
};

export default combineReducers( {
	initial,
	current,
} );
