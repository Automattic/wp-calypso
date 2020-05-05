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
};
