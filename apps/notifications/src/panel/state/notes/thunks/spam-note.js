import { recordTracksEvent } from '../../../helpers/stats';
import { wpcom } from '../../../rest-client/wpcom';
import { spamNote as spamNoteAction } from '../actions';
import bumpStat from '../utils/bump-stat';

const spamNote = ( note, immediately, restClient ) => async ( dispatch ) => {
	bumpStat( 'spam-comment' );
	recordTracksEvent( 'calypso_notification_note_spam', {
		note_type: note.type,
	} );

	if ( immediately ) {
		const comment = wpcom().site( note.meta.ids.site ).comment( note.meta.ids.comment );

		const commentData = await comment.get();
		commentData.status = 'spam';

		await comment.update( commentData );
	} else {
		restClient.global.updateUndoBar( 'spam', note );
	}

	dispatch( spamNoteAction( note.id ) );
};

export default spamNote;
