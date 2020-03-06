import * as types from '../../action-types';

import getIsNoteRead from '../../selectors/get-is-note-read';
import getNote from '../../selectors/get-note';

import store from '../../../flux/store';

import { bumpStat } from '../../../rest-client/bump-stat';

export const markAsRead = ( { getState }, { noteId } ) => {
	const state = getState();
	const note = getNote( state, noteId );

	if ( ! note || getIsNoteRead( state, note ) ) {
		return;
	}

	// If the note hasn't yet been marked as read then mark it
	store.get( 'global' ).client.readNote( noteId );

	try {
		localStorage.setItem( `note_read_status_${ noteId }`, '1' );
	} catch ( e ) {}

	bumpStat( 'notes-read-type', note.type );
};

export default {
	[ types.SELECT_NOTE ]: [ markAsRead ],
};
