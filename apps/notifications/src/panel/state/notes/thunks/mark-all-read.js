import { reportError, reportRequestError } from '../../../helpers/log-error';
import { recordTracksEvent } from '../../../helpers/stats';
import { markAllAsRead } from '../../../rest-client/wpcom';
import getAllNotes from '../../selectors/get-all-notes';
import getIsNoteRead from '../../selectors/get-is-note-read';
import { readNotes } from '../actions';

const toSeconds = ( timestamp ) => Math.floor( Date.parse( timestamp ) / 1000 );

/**
 * Marks every unread note on the account as read, loaded or not, and resolves with whether the server did it.
 *
 * Notes newer than the newest loaded one stay unread: they arrived after the count the person saw.
 */
const markAllRead = ( restClient ) => async ( dispatch, getState ) => {
	const newestNote = getAllNotes( getState() )[ 0 ];
	if ( ! newestNote ) {
		return false;
	}
	const time = toSeconds( newestNote.timestamp );

	let response;
	try {
		response = await markAllAsRead( time );
	} catch ( error ) {
		reportRequestError( 'read-all', error );
		return false;
	}
	if ( ! response?.success ) {
		reportError( 'read-all', response );
		return false;
	}

	recordTracksEvent( 'calypso_notification_mark_all_read', { count: response.count } );

	const state = getState();
	const noteIds = getAllNotes( state )
		.filter( ( note ) => toSeconds( note.timestamp ) <= time && ! getIsNoteRead( state, note ) )
		.map( ( note ) => note.id );

	// The stored status tells other tabs, and outlasts a reload until the server sends the notes again.
	noteIds.forEach( ( noteId ) => {
		try {
			localStorage.setItem( `note_read_status_${ noteId }`, '1' );
		} catch ( e ) {}
	} );

	dispatch( readNotes( noteIds ) );
	restClient?.refreshFilteredNotes();

	return true;
};

export default markAllRead;
