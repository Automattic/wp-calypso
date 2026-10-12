import { __ } from '@wordpress/i18n';
import type { Note } from '../types';

/** Returns the title for the open note, replacing the server's title for likes. */
export const getTemporaryNoteTitle = ( note: Note ) =>
	[ 'like', 'comment_like' ].includes( note.type ) ? __( 'Likes' ) : note.title;

/** Heads the list of people who acted. */
export const getPeopleHeading = ( note: Note ) => {
	switch ( note.type ) {
		case 'reblog':
			return __( 'Reblogs' );
		case 'follow':
			return __( 'Subscribers' );
		default:
			return note.title;
	}
};
