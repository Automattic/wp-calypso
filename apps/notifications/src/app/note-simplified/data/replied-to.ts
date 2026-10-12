import { getHeaderLink } from '../../templates/note-summary';
import { getRangeText } from './text';
import type { Note } from '../../types';

export type RepliedTo = {
	text: string;
	author?: string;
	authorUrl?: string;
	avatar?: string;
	url: string;
	date?: string | null;
};

// Someone's words are the news. A mention inside a post arrives as plain text, with no
// comment block.
export const COMMENT_TYPES = [ 'comment', 'automattcher' ];

/**
 * The comment a reply answers or a like is for. Without details from the endpoint, the
 * header holds it: its author, then its text.
 */
export function getRepliedTo( note: Note ): RepliedTo | undefined {
	const parentCommentId = note.meta?.ids?.parent_comment;
	const isReply = COMMENT_TYPES.includes( note.type ) && !! parentCommentId;
	if ( ! isReply && note.type !== 'comment_like' ) {
		return undefined;
	}

	const [ header, context ] = note.header ?? [];
	const details = note.meta?.parent_comment;
	// Blank lines between paragraphs would spend the clamped lines on nothing.
	const text = details?.text?.trim().replace( /\s*\n\s*/g, '\n' ) || context?.text?.trim();
	if ( ! text ) {
		return undefined;
	}

	return {
		text,
		author: details?.author_name ?? getRangeText( header, 'user' ),
		authorUrl: header && getHeaderLink( header ),
		avatar: details?.author_avatar ?? header?.media?.[ 0 ]?.url,
		url:
			details?.url ??
			( isReply
				? `${ note.url.split( '#' )[ 0 ] }#comment-${ parentCommentId }`
				: context?.ranges?.[ 0 ]?.url ) ??
			note.url,
		date: details?.date,
	};
}
