import { includes } from 'lodash';

import getNotes from './get-notes';

export const noteHasFilteredRead = ( noteState, noteId ) =>
	includes( noteState.filteredNoteReads, noteId );

export default ( state, noteId ) => noteHasFilteredRead( getNotes( state ), noteId );
