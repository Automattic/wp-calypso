import { sortBy, values } from 'lodash';

import getNotes from './get-notes';

let prevAllNotes;
let sortedNotes = [];

const noteId = ( { id } ) => id;
const parsedTimestamp = ( { timestamp } ) => Date.parse( timestamp );

/**
 * Returns all available notification data
 *
 * The caching in this function should be
 * replaced with a proper memoizer instead
 * of relying on this intermingled system.
 * However, in order to keep the changeset
 * small we are copying over this non-ideal
 * code until more formal refactorings.
 *
 * @param {object} notesState
 * @returns {object[]} list of notification objects
 */
export const getAllNotes = ( notesState ) => {
	const nextAllNotes = notesState.allNotes;

	if ( prevAllNotes === nextAllNotes ) {
		return sortedNotes;
	}

	prevAllNotes = nextAllNotes;
	sortedNotes = sortBy( values( nextAllNotes ), [ parsedTimestamp, noteId ] ).reverse();
	return sortedNotes;
};

export default ( state ) => getAllNotes( getNotes( state ) );
