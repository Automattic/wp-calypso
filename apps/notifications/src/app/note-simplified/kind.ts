import { getPeople, hasComment } from './data/blocks';
import { getContext } from './data/context';
import { COMMENT_TYPES } from './data/replied-to';
import type { Note } from '../types';

export type NoteKind = 'comment' | 'new-post' | 'reactions' | 'notice';

/** Which layout a note opens in. The first description that fits wins. */
export function getNoteKind( note: Note ): NoteKind {
	// Someone's words are the news: a comment, a reply or a mention.
	if ( COMMENT_TYPES.includes( note.type ) || hasComment( note ) ) {
		return 'comment';
	}
	// The post itself is the news.
	if ( note.type === 'new_post' ) {
		return 'new-post';
	}
	// People did something to a thing that can be shown, so they are listed beneath it.
	if ( getPeople( note ).length > 0 && getContext( note ) ) {
		return 'reactions';
	}
	// Everything else: something happened, with or without a person behind it.
	return 'notice';
}
