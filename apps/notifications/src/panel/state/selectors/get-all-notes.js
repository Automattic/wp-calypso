/**
 * Internal dependencies
 */
import getNotes from './get-notes';

let prevAllNotes;
let sortedNotes = [];

const byTimestamp = ( a, b ) => {
	const difference = Date.parse( a.timestamp ) - Date.parse( b.timestamp );
	if ( difference < 0 ) {
		return -1;
	}

	if ( difference > 0 ) {
		return 1;
	}

	return 0;
};
const byId = ( a, b ) => {
	if ( a.id < b.id ) {
		return -1;
	}

	if ( a.id > b.id ) {
		return 1;
	}

	return 0;
};

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
