/**
 * Internal dependencies
 */
import {
	CLOSE_PANEL,
	EDIT_COMMENT,
	NOTES_LOADED,
	NOTES_LOADING,
	SELECT_NOTE,
	SET_LAYOUT,
	UNDO_ACTION,
	VIEW_SETTINGS,
	SET_FILTER,
	ENABLE_KEYBOARD_SHORTCUTS,
	DISABLE_KEYBOARD_SHORTCUTS,
} from '../action-types';

export const closePanel = () => ( {
	type: CLOSE_PANEL,
} );

export const loadNotes = () => ( {
	type: NOTES_LOADING,
} );

export const loadedNotes = () => ( {
	type: NOTES_LOADED,
} );

export const selectNote = ( noteId ) => ( {
	type: SELECT_NOTE,
	noteId,
} );

export const setLayout = ( layout ) => ( {
	type: SET_LAYOUT,
	layout,
} );

export const undoAction = ( noteId ) => ( {
	type: UNDO_ACTION,
	noteId,
} );

export const unselectNote = () => selectNote( null );

export const viewSettings = () => ( {
	type: VIEW_SETTINGS,
} );

export const setFilter = ( filterName ) => ( {
	type: SET_FILTER,
	filterName,
} );

export const editComment = ( siteId, postId, commentId, href ) => ( {
	type: EDIT_COMMENT,
	siteId,
	postId,
	commentId,
	href,
} );

export const enableKeyboardShortcuts = () => ( { type: ENABLE_KEYBOARD_SHORTCUTS } );

export const disableKeyboardShortcuts = () => ( { type: DISABLE_KEYBOARD_SHORTCUTS } );

export default {
	closePanel,
	loadNotes,
	loadedNotes,
	selectNote,
	setLayout,
	undoAction,
	unselectNote,
	viewSettings,
	setFilter,
	editComment,
	enableKeyboardShortcuts,
	disableKeyboardShortcuts,
};
