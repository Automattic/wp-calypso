import { __ } from '@wordpress/i18n';
import type { Note } from '../types';

/** Returns the title for the open note, replacing the server's title for likes. */
export const getTemporaryNoteTitle = ( note: Note ) =>
	[ 'like', 'comment_like' ].includes( note.type ) ? __( 'Likes' ) : note.title;
