import * as types from '../../action-types';

import getIsNoteRead from '../../selectors/get-is-note-read';
import getNote from '../../selectors/get-note';

import { markReadStatus } from '../../../rest-client/wpcom';
import { bumpStat } from '../../../rest-client/bump-stat';

const clearLocalReadCache = ( noteId ) => {
	try {
		localStorage.removeItem( `note_read_status_${ noteId }` );
	} catch ( e ) {}
};

// Clear the local cache of read status
// if we get updated data from the server
export const clearReadCache = ( store, action ) => {
	const noteIds = action.notes ? action.notes.map( ( { id } ) => id ) : action.noteIds;

	noteIds.forEach( clearLocalReadCache );
};

export const markAsRead = ( { getState }, { noteId } ) => {
	const state = getState();
	const note = getNote( state, noteId );

	if ( ! note || getIsNoteRead( state, note ) ) {
		return;
	}

	// If the note hasn't yet been marked as read then mark it
	try {
		localStorage.setItem( `note_read_status_${ noteId }`, '1' );
	} catch ( e ) {}

	bumpStat( 'notes-read-type', note.type );

	markReadStatus( noteId, true, ( error, data ) => {
		if ( error || ! data.success ) {
			try {
				return localStorage.removeItem( `note_read_status_${ noteId }` );
			} catch ( e ) {}
		}

		try {
			localStorage.setItem( `note_read_status_${ noteId }`, '1' );
		} catch ( e ) {}
	} );
};

export default {
	[ types.NOTES_ADD ]: [ clearReadCache ],
	[ types.NOTES_REMOVE ]: [ clearReadCache ],
	[ types.SELECT_NOTE ]: [ markAsRead ],
};
