import { combineReducers } from 'redux';

import {
	NOTES_LOADED,
	NOTES_LOADING,
	SELECT_NOTE,
	SET_IS_SHOWING,
	SET_FILTER,
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

export const filterName = ( state = 'all', { type, filterName } ) =>
	SET_FILTER === type ? filterName : state;

export default combineReducers( {
	isLoading,
	isPanelOpen,
	selectedNoteId,
	filterName,
} );
