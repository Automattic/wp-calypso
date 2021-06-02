/**
 * Internal dependencies
 */
import getNotes from './get-notes';

export const noteHasFilteredRead = ( noteState, noteId ) =>
	noteState.filteredNoteReads.includes( noteId );

export default ( state, noteId ) => noteHasFilteredRead( getNotes( state ), noteId );
