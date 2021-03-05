/**
 * Internal dependencies
 */
import getNotes from './get-notes';
import { getActions } from '../../helpers/notes';

export const getIsNoteApproved = ( notesState, note ) => {
	const noteApprovals = notesState.noteApprovals;

	if ( noteApprovals.hasOwnProperty( note.id ) ) {
		return noteApprovals[ note.id ];
	}

	const actionMeta = getActions( note );
	return actionMeta && true === actionMeta[ 'approve-comment' ];
};

export default ( state, note ) => getIsNoteApproved( getNotes( state ), note );
