/**
 * Internal dependencies
 */
import getNotes from './get-notes';

export const getIsNoteRead = ( notesState, note ) => {
	const localReads = notesState.noteReads;

	if ( localReads.hasOwnProperty( note.id ) ) {
		return localReads[ note.id ];
	}

	// this absolutely needs to be redone but is not happening at
	// the time of moving it from rest-client to keep the PR and
	// changeset small. the persistent state should come through
	// Redux middleware instead of operating at such a granular
	// layer but introducing serializers is enough for its own PR
	try {
		const storedRead = localStorage.getItem( `note_read_status_${ note.id }` );
		if ( null !== storedRead && '1' === storedRead ) {
			return true;
		}
	} catch ( e ) {}

	return !! note.read;
};

export default ( state, note ) => getIsNoteRead( getNotes( state ), note );
