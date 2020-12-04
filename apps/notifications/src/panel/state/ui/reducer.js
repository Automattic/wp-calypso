/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
	NOTES_LOADED,
	NOTES_LOADING,
	SELECT_NOTE,
	SET_IS_SHOWING,
	SET_FILTER,
	ENABLE_KEYBOARD_SHORTCUTS,
	DISABLE_KEYBOARD_SHORTCUTS,
} from '../action-types';

export const isLoading = ( state = true, { type } ) => {
	if ( NOTES_LOADING === type ) {
		return true;
	}

	if ( NOTES_LOADED === type ) {
		return false;
	}

	return state;
};

export const isPanelOpen = ( state = false, { type, isShowing } ) =>
	SET_IS_SHOWING === type ? isShowing : state;

export const selectedNoteId = ( state = null, { type, noteId } ) => {
	if ( SELECT_NOTE === type ) {
		return noteId;
	}

	if ( SET_FILTER === type ) {
		return null;
	}

	return state;
};

export const keyboardShortcutsAreEnabled = ( state = false, action ) => {
	switch ( action.type ) {
		case ENABLE_KEYBOARD_SHORTCUTS: {
			return true;
		}
		case DISABLE_KEYBOARD_SHORTCUTS: {
			return false;
		}
	}
	return state;
};

export const filterName = ( state = 'all', { type, filterName } ) =>
	SET_FILTER === type ? filterName : state;

export default combineReducers( {
	isLoading,
	isPanelOpen,
	selectedNoteId,
	filterName,
	keyboardShortcutsAreEnabled,
} );
