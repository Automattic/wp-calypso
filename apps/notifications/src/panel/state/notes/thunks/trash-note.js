import { reportError } from '../../../helpers/log-error';
import { recordTracksEvent } from '../../../helpers/stats';
import { wpcom } from '../../../rest-client/wpcom';
import { trashNote as trashNoteAction } from '../actions';
import bumpStat from '../utils/bump-stat';

const trashNote = ( note, immediately, restClient ) => async ( dispatch ) => {
	bumpStat( 'trash-comment' );
	recordTracksEvent( 'calypso_notification_note_trash', {
		note_type: note.type,
	} );

	if ( immediately ) {
		try {
			await wpcom().site( note.meta.ids.site ).comment( note.meta.ids.comment ).del();
		} catch ( error ) {
			reportError( 'trash', error, { note_type: note.type } );
			throw error;
		}
	} else {
		restClient.global.updateUndoBar( 'trash', note );
	}

	dispatch( trashNoteAction( note.id ) );
};

export default trashNote;
