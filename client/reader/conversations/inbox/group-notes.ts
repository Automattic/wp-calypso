import type { NotificationNote as Note } from '@automattic/api-core';

export interface Commenter {
	name: string;
	avatar: string;
}

/**
 * Why the latest note reached the current user: a comment on their post, a reply to
 * their comment, a mention, or something the note doesn't say.
 */
export type ConversationContext = 'post' | 'reply' | 'mention' | 'other';

export interface Conversation {
	key: string;
	siteId: number;
	postId: number;
	title: string;
	excerpt: string;
	timestamp: number;
	latestCommentId?: number;
	context: ConversationContext;
	commenters: Commenter[];
	noteIds: number[];
	unreadNoteIds: number[];
}

const getPostTitle = ( note: Note ): string => {
	const sources = [ ...( note.subject ?? [] ), ...( note.header ?? [] ), ...( note.body ?? [] ) ];
	for ( const { text, ranges } of sources ) {
		const range = ranges?.find( ( { type } ) => type === 'post' );
		if ( text && range && range.indices[ 1 ] > range.indices[ 0 ] ) {
			return text.slice( range.indices[ 0 ], range.indices[ 1 ] );
		}
	}
	return '';
};

const getCommenter = ( note: Note ): Commenter | null => {
	const userBlock = note.body?.find( ( block ) => block.type === 'user' );
	if ( userBlock?.text ) {
		return { name: userBlock.text, avatar: userBlock.media?.[ 0 ]?.url ?? note.icon };
	}

	// Some comment and reply notes only identify the actor through a `user` range in the subject.
	const subject = note.subject?.[ 0 ];
	const userRange = subject?.ranges?.find( ( { type } ) => type === 'user' );
	if ( subject && userRange && userRange.indices[ 1 ] > userRange.indices[ 0 ] ) {
		return {
			name: subject.text.slice( userRange.indices[ 0 ], userRange.indices[ 1 ] ),
			avatar: note.icon,
		};
	}

	return null;
};

// The API sends noticons as icon font glyphs.
const MENTION_NOTICON = '\uf814';
const COMMENT_NOTICON = '\uf300';

// The header names the post author on a comment and the parent comment author on a reply.
const getContext = ( note: Note, currentUserId?: number | null ): ConversationContext => {
	if ( note.noticon === MENTION_NOTICON ) {
		return 'mention';
	}
	const headerUser = note.header?.[ 0 ]?.ranges?.find( ( { type } ) => type === 'user' );
	if (
		note.noticon !== COMMENT_NOTICON ||
		! currentUserId ||
		Number( headerUser?.id ) !== currentUserId
	) {
		return 'other';
	}
	return note.meta?.ids?.parent_comment ? 'reply' : 'post';
};

export const getConversationKey = ( siteId: number | string, postId: number | string ) =>
	`${ siteId }-${ postId }`;

export function groupNotesByPost( notes: Note[], currentUserId?: number | null ): Conversation[] {
	const groups = new Map< string, Conversation >();

	const sorted = [ ...notes ].sort(
		( a, b ) => Date.parse( b.timestamp ) - Date.parse( a.timestamp )
	);

	for ( const note of sorted ) {
		const siteId = note.meta?.ids?.site;
		const postId = note.meta?.ids?.post;
		if ( ! siteId || ! postId ) {
			continue;
		}

		const key = getConversationKey( siteId, postId );
		let group = groups.get( key );
		if ( ! group ) {
			group = {
				key,
				siteId,
				postId,
				title: getPostTitle( note ),
				excerpt: note.subject?.[ 1 ]?.text ?? '',
				timestamp: Date.parse( note.timestamp ),
				latestCommentId: note.meta?.ids?.comment,
				context: getContext( note, currentUserId ),
				commenters: [],
				noteIds: [],
				unreadNoteIds: [],
			};
			groups.set( key, group );
		}

		group.noteIds.push( note.id );
		if ( ! note.read ) {
			group.unreadNoteIds.push( note.id );
		}

		const commenter = getCommenter( note );
		if ( commenter && ! group.commenters.some( ( { name } ) => name === commenter.name ) ) {
			group.commenters.push( commenter );
		}
	}

	return [ ...groups.values() ];
}
