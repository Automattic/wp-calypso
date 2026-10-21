import { recordTracksEvent } from '../../../helpers/stats';
import { markReadStatus } from '../../../rest-client/wpcom';
import { readNote, unreadNote } from '../actions';

/**
 * Marks a note as unread, reverting to read if the server rejects it.
 */
const markUnread = ( note, restClient ) => ( dispatch ) => {
	recordTracksEvent( 'calypso_notification_note_unread', {
		note_type: note.type,
	} );

	try {
		localStorage.setItem( `note_read_status_${ note.id }`, '0' );
	} catch ( e ) {}

	dispatch( unreadNote( note.id ) );

	markReadStatus( note.id, false, ( error, response ) => {
		if ( error || ! response.success ) {
			try {
				localStorage.setItem( `note_read_status_${ note.id }`, '1' );
			} catch ( e ) {}

			dispatch( readNote( note.id ) );
			return;
		}

		restClient?.getFilteredNotes();
	} );
};

export default markUnread;
