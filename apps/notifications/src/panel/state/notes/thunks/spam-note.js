/**
 * Internal dependencies
 */
import { spamNote as spamNoteAction } from '../actions';
import { bumpStat as rawBumpStat } from '../../../rest-client/bump-stat';
const { recordTracksEvent } = require( '../../../helpers/stats' );

function bumpStat( name ) {
	rawBumpStat( 'notes-click-action', name );
}

const spamNote = ( note ) => ( dispatch ) => {
	bumpStat( 'spam-comment' );
	recordTracksEvent( 'calypso_notification_note_spam', {
		note_type: note.type,
	} );

	dispatch( spamNoteAction( note.id ) );
};

export default spamNote;
