/**
 * Internal dependencies
 */
import { trashNote as trashNoteAction } from '../actions';
import { bumpStat as rawBumpStat } from '../../../rest-client/bump-stat';
const { recordTracksEvent } = require( '../../../helpers/stats' );

function bumpStat( name ) {
	rawBumpStat( 'notes-click-action', name );
}

const trashNote = ( note, restClient ) => ( dispatch ) => {
	bumpStat( 'trash-comment' );
	recordTracksEvent( 'calypso_notification_note_trash', {
		note_type: note.type,
	} );

	dispatch( trashNoteAction( note.id ) );
	restClient.global.updateUndoBar( 'trash', note );
};

export default trashNote;
