/**
 * Internal dependencies
 */
import * as types from '../../action-types';
import actions from '../../actions';
import getAllNotes from '../../selectors/get-all-notes';
import getIsNoteHidden from '../../selectors/get-is-note-hidden';
import { findNextNoteId } from '../../../templates';

export const advanceToNextNote = ( { dispatch, getState }, { noteId } ) => {
	const state = getState();

	// move to next note in the sequence…
	const nextNoteId = findNextNoteId(
		noteId,
		getAllNotes( state ).filter( ( { id } ) => ! getIsNoteHidden( state, id ) )
	);

	// if the window is wide enough and we have a next node
	// then go ahead and open it
	// otherwise go back to the list
	if ( nextNoteId && window.innerWidth >= 800 ) {
		dispatch( actions.ui.selectNote( nextNoteId ) );
	} else {
		dispatch( actions.ui.unselectNote() );
	}
};

const toggleDrawer = ( { dispatch }, { noteId } ) =>
	dispatch( actions.ui.setLayout( noteId ? 'widescreen' : 'narrow' ) );

export default {
	[ types.SELECT_NOTE ]: [ toggleDrawer ],
	[ types.SPAM_NOTE ]: [ advanceToNextNote ],
	[ types.TRASH_NOTE ]: [ advanceToNextNote ],
};
