import { recordTracksEvent } from '../../../helpers/stats';
import { wpcom } from '../../../rest-client/wpcom';
import { removeNotes as removeNotesAction, trashNote as trashNoteAction } from '../actions';
import bumpStat from '../utils/bump-stat';

const trashNote = ( note, immediately, restClient ) => async ( dispatch ) => {
	bumpStat( 'trash-comment' );
	recordTracksEvent( 'calypso_notification_note_trash', {
		note_type: note.type,
	} );

	dispatch( trashNoteAction( note.id ) );

	if ( immediately ) {
		await wpcom().site( note.meta.ids.site ).comment( note.meta.ids.comment ).del();
		dispatch( removeNotesAction( [ note.id ], true ) );
	} else {
		restClient.global.updateUndoBar( 'trash', note );
	}
};

export default trashNote;
