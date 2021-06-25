/**
 * Internal dependencies
 */
import getNotes from './get-notes';

export const getIsNoteHidden = ( notesState, noteId ) =>
	true === notesState.hiddenNoteIds[ noteId ];

export default ( state, noteId ) => getIsNoteHidden( getNotes( state ), noteId );
