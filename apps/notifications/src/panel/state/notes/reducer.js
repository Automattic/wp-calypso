/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import { keyBy, omit } from 'lodash';

/**
 * Internal dependencies
 */
import * as types from '../action-types';

export const allNotes = ( state = {}, { type, notes, noteIds } ) => {
	if ( types.NOTES_ADD === type ) {
		return { ...state, ...keyBy( notes, 'id' ) };
	}

	if ( types.NOTES_REMOVE === type ) {
		return omit( state, noteIds );
	}

	return state;
};

export const hiddenNoteIds = ( state = {}, { type, noteId } ) => {
	if ( types.TRASH_NOTE === type || types.SPAM_NOTE === type ) {
		return { ...state, [ noteId ]: true };
	}

	if ( types.UNDO_ACTION === type ) {
		return omit( state, [ noteId ] );
	}

	return state;
};

export const noteApprovals = ( state = {}, { type, noteId, isApproved } ) => {
	if ( types.APPROVE_NOTE === type ) {
		return { ...state, [ noteId ]: isApproved };
	}

	if ( types.RESET_LOCAL_APPROVAL === type ) {
		return omit( state, [ noteId ] );
	}

	return state;
};

export const noteLikes = ( state = {}, { type, noteId, isLiked } ) => {
	if ( types.LIKE_NOTE === type ) {
		return { ...state, [ noteId ]: isLiked };
	}

	if ( types.RESET_LOCAL_LIKE === type ) {
		return omit( state, [ noteId ] );
	}

	return state;
};

export const noteReads = ( state = {}, { type, noteId } ) => {
	if ( ( types.READ_NOTE === type || types.SELECT_NOTE === type ) && noteId ) {
		return { ...state, [ noteId ]: true };
	}

	return state;
};

export const filteredNoteReads = ( state = [], { type, noteId } ) => {
	if ( types.SELECT_NOTE === type ) {
		return [ ...state, noteId ];
	}

	if ( types.SET_FILTER === type ) {
		return [];
	}

	return state;
};

export default combineReducers( {
	allNotes,
	hiddenNoteIds,
	noteApprovals,
	noteLikes,
	noteReads,
	filteredNoteReads,
} );
