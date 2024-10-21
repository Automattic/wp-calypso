import { recordTracksEvent } from '../../../helpers/stats';
import { spamNote as spamNoteAction } from '../actions';
import bumpStat from '../utils/bump-stat';

const spamNote = ( note, siteId, restClient ) => ( dispatch ) => {
	bumpStat( 'spam-comment' );
	recordTracksEvent( 'calypso_notification_note_spam', {
		note_type: note.type,
	} );

	dispatch( spamNoteAction( note.id ) );
	restClient.global.updateUndoBar( 'spam', note );
};

export default spamNote;
