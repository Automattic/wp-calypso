import { __ } from '@wordpress/i18n';
import type { Note } from '../types';

export const getTemporaryNoteTitle = ( note: Note ) =>
	[ 'like', 'comment_like' ].includes( note.type ) ? __( 'Likes' ) : note.title;
