import {
	getNoteBodyParts as classifyNoteBody,
	getNoteLikedComment,
	getNoteParentComment,
	getNoteUserRef,
} from '@automattic/notifications/src/common/body-parts';
import { getNoticonName } from '@automattic/notifications/src/common/icon-map';
import { getBlockSegments, getTitleSegments } from '@automattic/notifications/src/common/segments';
import { getNoteExcerpt, getNoteSender } from '@automattic/notifications/src/common/summary';
import { __, _n, sprintf } from '@wordpress/i18n';
import type { Note } from './engine';
import type { NoteBodyParts, NoteUserRef } from '@automattic/notifications/src/common/body-parts';
import type { TitleSegment } from '@automattic/notifications/src/common/segments';

/*
 * The one place the dashboard names the notifications package's pure helpers.
 * Everything here is data in, data out; rendering lives next door.
 */
export { getBlockSegments, getTitleSegments } from '@automattic/notifications/src/common/segments';
export type { BlockSegment, TitleSegment } from '@automattic/notifications/src/common/segments';
export {
	getNoteLikedComment,
	getNoteParentComment,
	getNoteUserRef,
} from '@automattic/notifications/src/common/body-parts';
export type {
	NoteBodyParts,
	NoteParentComment,
	NoteUserRef,
} from '@automattic/notifications/src/common/body-parts';
export { getNoticonName } from '@automattic/notifications/src/common/icon-map';
export type { NoticonName } from '@automattic/notifications/src/common/icon-map';
export { getRichNodes } from '@automattic/notifications/src/common/rich-text';
export type { RichNode } from '@automattic/notifications/src/common/rich-text';
export {
	getNoteExcerpt,
	getNoteSender,
	getNoteTitle,
} from '@automattic/notifications/src/common/summary';
export { getTimeGroupIndex } from '@automattic/notifications/src/common/time-groups';

export type NoteBlock = Note[ 'body' ][ number ];

export function getNoteTypeLabel( note: Note ): string {
	switch ( note.type ) {
		case 'comment':
			return getNoticonName( note.noticon ) === 'mention' ? __( 'Mention' ) : __( 'Comment' );
		case 'comment_like':
			return __( 'Comment like' );
		case 'like':
			return __( 'Like' );
		case 'follow':
			return __( 'New subscriber' );
		case 'post':
			return __( 'New post' );
		case 'reblog':
			return __( 'Reblog' );
		default: {
			const label = note.type.replace( /_/g, ' ' );
			return label.charAt( 0 ).toUpperCase() + label.slice( 1 );
		}
	}
}

/** Whether the note is a reply to one of the given user's own comments. */
/**
 * The muted line under a list row's title: what the notification is, not what
 * it says (the title already says that).
 */
export function getNoteListMeta( note: Note ): string {
	if ( note.type === 'like' || note.type === 'comment_like' ) {
		const likers = ( note.body ?? [] ).filter( ( block ) => block.type === 'user' ).length;
		if ( likers > 0 ) {
			/* translators: %d: number of likes on the post or comment. */
			return sprintf( _n( '%d like', '%d likes', likers ), likers );
		}
		return getNoteTypeLabel( note );
	}
	if ( note.type === 'follow' ) {
		return __( 'Subscribed' );
	}
	return getNoteTypeLabel( note );
}

export function isReplyToUser( note: Note, userId: number ): boolean {
	if ( ! note.meta?.ids?.parent_comment ) {
		return false;
	}
	const parentAuthor = note.header?.[ 0 ]?.ranges?.[ 0 ];
	return parentAuthor?.type === 'user' && Number( parentAuthor.id ) === userId;
}

// A reply answers the note's own comment, whose author is the body's user
// block; the header names the context (parent comment or post) instead.
export function getReplyRecipient( note: Note ): string | null {
	return note.body?.find( ( block ) => block.type === 'user' )?.text ?? getNoteSender( note );
}

// The API trims long header excerpts and ends them with an ellipsis.
export function isTruncated( text: string ): boolean {
	return /(…|\.\.\.)\s*$/.test( text );
}

/**
 * Split the note's body blocks for display: the comment block becomes the
 * message; the rest are context lines. On comment notes the user blocks are
 * dropped (the header already names the sender), while on other note types
 * they are real content (who liked/followed). Replies keep theirs: their
 * header shows the comment being answered, so nothing else names the sender.
 */
export function getNoteBodyParts( note: Note ): NoteBodyParts {
	const { context, comment, postscript } = classifyNoteBody( note );
	if ( ! comment || getNoteParentComment( note ) ) {
		return { context, comment, postscript };
	}
	const keep = ( block: NoteBlock ) => block.type !== 'user';
	return { context: context.filter( keep ), comment, postscript: postscript.filter( keep ) };
}

/** Context blocks in payload order, with consecutive user blocks folded into one run. */
export type ContextRun =
	| { kind: 'users'; users: NoteUserRef[] }
	| { kind: 'text'; block: NoteBlock };

export function getContextRuns( blocks: NoteBlock[] ): ContextRun[] {
	const runs: ContextRun[] = [];
	for ( const block of blocks ) {
		const last = runs[ runs.length - 1 ];
		if ( block.type !== 'user' ) {
			runs.push( { kind: 'text', block } );
		} else if ( last?.kind === 'users' ) {
			last.users.push( getNoteUserRef( block ) );
		} else {
			runs.push( { kind: 'users', users: [ getNoteUserRef( block ) ] } );
		}
	}
	return runs;
}

// The post a title names is its last emphasised range after the author.
function getPostLink( segments: TitleSegment[] ): TitleSegment | null {
	const post = segments.slice( 1 ).filter( ( segment ) => segment.bold );
	return post.length > 0 ? post[ post.length - 1 ] : null;
}

type NoteViewBase = {
	note: Note;
	typeLabel: string;
	url: string | null;
	timestamp: string;
	context: ContextRun[];
	postscript: NoteBlock[];
};

/** Everything a detail layout needs, resolved once per note type. */
export type NoteView = NoteViewBase &
	(
		| {
				kind: 'thread';
				parent: {
					/** The parent's author, on its own. */
					author: TitleSegment[];
					/** The post it sits on, for a heading. */
					postLink: TitleSegment | null;
					excerpt: string;
					url: string | null;
					isTruncated: boolean;
					avatarUrl: string | null;
				};
				reply: {
					author: NoteUserRef | null;
					replyingTo: string;
					body: NoteBlock | null;
				};
		  }
		| {
				kind: 'comment';
				avatarUrl: string;
				/** The commenter, on their own. */
				author: TitleSegment[];
				/** The post commented on, for a heading. */
				postLink: TitleSegment | null;
				body: NoteBlock;
		  }
		| { kind: 'achievement'; excerpt: string | null }
		| {
				kind: 'like';
				avatarUrl: string;
				title: TitleSegment[];
				liker: NoteUserRef | null;
				snippet: string | null;
				likedComment: NoteBlock | null;
				excerpt: string | null;
		  }
		| { kind: 'generic'; avatarUrl: string; title: TitleSegment[]; excerpt: string | null }
	);

export function getNoteView( note: Note ): NoteView {
	const { context, comment, postscript } = getNoteBodyParts( note );
	const base: NoteViewBase = {
		note,
		typeLabel: getNoteTypeLabel( note ),
		url: note.url || null,
		timestamp: note.timestamp,
		context: getContextRuns( context ),
		postscript,
	};
	const title = getTitleSegments( note );
	const excerpt = getNoteExcerpt( note );

	const parentComment = getNoteParentComment( note );
	if ( parentComment ) {
		const authorBlock = context.find( ( block ) => block.type === 'user' );
		const authorSegments = getBlockSegments( parentComment.author ).map( ( segment ) => ( {
			text: segment.text,
			bold: segment.type === 'user' || segment.type === 'post',
			url: segment.url ?? null,
		} ) );
		return {
			...base,
			kind: 'thread',
			context: getContextRuns( context.filter( ( block ) => block.type !== 'user' ) ),
			parent: {
				// The header's first range is the author (getNoteParentComment
				// guarantees it), so the first segment is the name.
				author: authorSegments.slice( 0, 1 ),
				postLink: getPostLink( authorSegments ),
				excerpt: parentComment.excerpt.text,
				url: parentComment.url,
				isTruncated: isTruncated( parentComment.excerpt.text ),
				avatarUrl: parentComment.avatarUrl,
			},
			reply: {
				author: authorBlock ? getNoteUserRef( authorBlock ) : null,
				replyingTo: parentComment.authorName,
				body: comment,
			},
		};
	}

	if ( comment ) {
		// The subject leads with the commenter as a bold range; without one the
		// whole title stands in for the name.
		const leadsWithAuthor = title.length > 1 && title[ 0 ].bold;
		return {
			...base,
			kind: 'comment',
			avatarUrl: note.icon,
			author: leadsWithAuthor ? title.slice( 0, 1 ) : title,
			postLink: leadsWithAuthor ? getPostLink( title ) : null,
			body: comment,
		};
	}

	const hasBadge = ( note.body ?? [] ).some( ( block ) =>
		( block.media ?? [] ).some( ( media ) => media.type === 'badge' )
	);
	if ( hasBadge ) {
		// The "See all your achievements" line is a call to action for the
		// panel; the inbox has room to show the achievement itself.
		const isAchievementsLink = ( block: NoteBlock ) =>
			( block.ranges ?? [] ).some( ( range ) => range.url?.includes( '/me/achievements' ) );
		return {
			...base,
			kind: 'achievement',
			excerpt,
			context: getContextRuns( context.filter( ( block ) => ! isAchievementsLink( block ) ) ),
			postscript: postscript.filter( ( block ) => ! isAchievementsLink( block ) ),
		};
	}

	if ( note.type === 'like' || note.type === 'comment_like' ) {
		const [ userBlock, snippetBlock ] = note.header ?? [];
		const liker = userBlock ? getNoteUserRef( userBlock ) : null;
		const likedComment = getNoteLikedComment( note );
		return {
			...base,
			kind: 'like',
			avatarUrl: liker?.avatarUrl ?? note.icon,
			title,
			liker,
			snippet: likedComment ? null : snippetBlock?.text ?? null,
			likedComment,
			excerpt: likedComment ? null : excerpt,
		};
	}

	return { ...base, kind: 'generic', avatarUrl: note.icon, title, excerpt };
}
