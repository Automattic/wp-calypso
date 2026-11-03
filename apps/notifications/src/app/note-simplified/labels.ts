import { __ } from '@wordpress/i18n';
import type { Note } from '../types';

const REBLOG_NOTICON = '\uf805';

export const getTemporaryNoteTitle = ( note: Note ) => {
	switch ( note.type ) {
		case 'like':
		case 'comment_like':
			return __( 'Likes' );
		case 'follow':
			return __( 'Subscribers' );
		case 'activitypub_followed_note':
			return __( 'Followers' );
		case 'activitypub_interaction_note':
			return note.noticon === REBLOG_NOTICON ? __( 'Reposts' ) : __( 'Likes' );
		default:
			return note.title;
	}
};
