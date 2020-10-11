/**
 * Internal dependencies
 */
import getNotes from './get-notes';

export const getNote = ( notesState, noteId ) => notesState.allNotes[ noteId ];

export default ( state, noteId ) => getNote( getNotes( state ), noteId );
