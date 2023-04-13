import getNotes from './get-notes';

let prevAllNotes;
let sortedNotes = [];

const byTimestamp = ( a, b ) => Date.parse( a.timestamp ) - Date.parse( b.timestamp );
const byId = ( a, b ) => a.id - b.id;

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
 * @param {Object} notesState
 * @returns {Object[]} list of notification objects
 */
export const getAllNotes = ( notesState ) => {
	const nextAllNotes = notesState.allNotes;

	if ( prevAllNotes === nextAllNotes ) {
		return sortedNotes;
	}

	prevAllNotes = nextAllNotes;
	sortedNotes = Object.values( nextAllNotes )
		.sort( ( a, b ) => {
			const chronologicalOrder = byTimestamp( a, b );
			if ( chronologicalOrder === 0 ) {
				return byId( a, b );
			}

			return chronologicalOrder;
		} )
		.reverse();
	return sortedNotes;
};

export default ( state ) => getAllNotes( getNotes( state ) );
