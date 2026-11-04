import { __ } from '@wordpress/i18n';
import type { Note } from '../types';

const STAR_NOTICON = '\uf408';
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
			if ( note.noticon === STAR_NOTICON ) {
				return __( 'Likes' );
			}
			if ( note.noticon === REBLOG_NOTICON ) {
				return __( 'Reposts' );
			}
			return note.title;
		default:
			return note.title;
	}
};
