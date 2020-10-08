/**
 * External dependencies
 */
import { includes } from 'lodash';

/**
 * Internal dependencies
 */
import getNotes from './get-notes';

export const noteHasFilteredRead = ( noteState, noteId ) =>
	includes( noteState.filteredNoteReads, noteId );

export default ( state, noteId ) => noteHasFilteredRead( getNotes( state ), noteId );
