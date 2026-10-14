import { getActions } from '../../helpers/notes';
import { getIsNoteApproved } from './get-is-note-approved';
import getNotes from './get-notes';

export const getIsNotePendingApproval = ( notesState, note ) =>
	'comment' === note.type &&
	'approve-comment' in getActions( note ) &&
	! getIsNoteApproved( notesState, note );

export default ( state, note ) => getIsNotePendingApproval( getNotes( state ), note );
