import { reportError, reportRequestError } from '../../../helpers/log-error';
import { recordTracksEvent } from '../../../helpers/stats';
import { markReadStatus } from '../../../rest-client/wpcom';
import { readNote, unreadNote } from '../actions';

// `success` is true even when nothing changed. `updated` lists the notes the
// request touched that are unread afterwards, so that is the confirmation.
const isUnreadOnServer = ( response, noteId ) =>
	!! response?.success &&
	( ! Array.isArray( response.updated ) ||
		response.updated.map( String ).includes( String( noteId ) ) );

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
		if ( error || ! isUnreadOnServer( response, note.id ) ) {
			if ( error ) {
				reportRequestError( 'unread', error );
			} else {
				reportError( 'unread', response );
			}
			try {
				localStorage.setItem( `note_read_status_${ note.id }`, '1' );
			} catch ( e ) {}

			dispatch( readNote( note.id ) );
			return;
		}

		restClient?.refreshFilteredNotes();
	} );
};

export default markUnread;
