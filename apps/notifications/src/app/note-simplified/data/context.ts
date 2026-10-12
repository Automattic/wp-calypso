import { getHeaderCard } from './header-card';
import { getCommentedPost, getPost, isAboutPost } from './post';
import { getRepliedTo } from './replied-to';
import type { HeaderCard } from './header-card';
import type { Post } from './post';
import type { RepliedTo } from './replied-to';
import type { Note } from '../../types';

export type Context =
	| { kind: 'comment'; repliedTo: RepliedTo; post?: Post }
	| { kind: 'post'; post?: Post }
	| { kind: 'card'; card: HeaderCard };

/** What a note concerns, when nobody is speaking: a comment, else a post, else its header. */
export function getContext( note: Note ): Context | undefined {
	const repliedTo = getRepliedTo( note );
	if ( repliedTo ) {
		return { kind: 'comment', repliedTo, post: getCommentedPost( note, repliedTo.text ) };
	}
	if ( isAboutPost( note ) ) {
		return { kind: 'post', post: getPost( note ) };
	}
	const card = getHeaderCard( note );
	return card && { kind: 'card', card };
}

/** A card names its own site, so nothing else needs to say where it happened. */
export const namesSite = ( context?: Context ) =>
	!! context && ( context.kind !== 'comment' || !! context.post );
