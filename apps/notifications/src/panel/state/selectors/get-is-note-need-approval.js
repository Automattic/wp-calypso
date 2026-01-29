import { getActions } from '../../helpers/notes';
import getNotes from './get-notes';

export const getIsNoteNeedApproval = ( notesState, note ) => {
	const noteApprovals = notesState.noteApprovals;

	if ( noteApprovals.hasOwnProperty( note.id ) ) {
		return ! noteApprovals[ note.id ];
	}

	const actionMeta = getActions( note );
	return actionMeta && false === actionMeta[ 'approve-comment' ];
};

export default ( state, note ) => getIsNoteNeedApproval( getNotes( state ), note );
