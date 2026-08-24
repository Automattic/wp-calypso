import {
	CLOSE_PANEL,
	EDIT_COMMENT,
	NOTES_LOADED,
	NOTES_LOADING,
	SELECT_NOTE,
	SET_LAYOUT,
	UNDO_ACTION,
	VIEW_SETTINGS,
	CLOSE_SHORTCUTS_POPOVER,
	TOGGLE_SHORTCUTS_POPOVER,
	SET_FILTER,
	ENABLE_KEYBOARD_SHORTCUTS,
	DISABLE_KEYBOARD_SHORTCUTS,
	ANSWER_PROMPT,
} from '../action-types';

export const closePanel = () => ( {
	type: CLOSE_PANEL,
} );

// Pass the in-flight filter fragment (e.g. `{ unread: 1 }`) for a filtered fetch,
// or nothing for the unfiltered poll. See the `filteredLoading` reducer.
/**
 * @param {{ filter?: Object | null }} [options]
 */
export const loadNotes = ( { filter = null } = {} ) => ( {
	type: NOTES_LOADING,
	filter,
} );

/**
 * @param {{ filter?: Object | null }} [options]
 */
export const loadedNotes = ( { filter = null } = {} ) => ( {
	type: NOTES_LOADED,
	filter,
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

export const closeShortcutsPopover = () => ( {
	type: CLOSE_SHORTCUTS_POPOVER,
} );
export const toggleShortcutsPopover = () => ( {
	type: TOGGLE_SHORTCUTS_POPOVER,
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

export const answerPrompt = ( siteId, href ) => ( {
	type: ANSWER_PROMPT,
	siteId,
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
	closeShortcutsPopover,
	toggleShortcutsPopover,
	setFilter,
	editComment,
	enableKeyboardShortcuts,
	disableKeyboardShortcuts,
	answerPrompt,
};
