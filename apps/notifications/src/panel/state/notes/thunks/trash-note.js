/**
 * Internal dependencies
 */
import { trashNote as trashNoteAction } from '../actions';
import { recordTracksEvent } from '../../../helpers/stats';
import bumpStat from '../utils/bump-stat';

const trashNote = ( note, restClient ) => ( dispatch ) => {
	bumpStat( 'trash-comment' );
	recordTracksEvent( 'calypso_notification_note_trash', {
		note_type: note.type,
	} );

	dispatch( trashNoteAction( note.id ) );
	restClient.global.updateUndoBar( 'trash', note );
};

export default trashNote;
