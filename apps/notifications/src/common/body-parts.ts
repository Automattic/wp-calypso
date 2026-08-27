import type { Block, Note } from './types';

export type NoteBlockSignature = { type: string; id: number | string | null };

/**
 * Classify each body block: its `type` when set, `reply` when the block's
 * second range points at the note's own reply comment, and otherwise the
 * first present id kind (prompt/comment/post/user). Moved verbatim from the
 * panel's templates/functions.
 */
export function getSignature( blocks: Block[], note?: Note ): NoteBlockSignature[] {
	if ( ! blocks || ! blocks.length ) {
		return [];
	}

	return blocks.map( ( block ) => {
		let type: string = 'text';
		let id: number | string | null = null;

		if ( 'undefined' !== typeof block.type ) {
			type = block.type;
		}

		if ( note && note.meta && note.meta.ids && note.meta.ids.reply_comment ) {
			if (
				block.ranges &&
				block.ranges.length > 1 &&
				block.ranges[ 1 ].id === note.meta.ids.reply_comment
			) {
				type = 'reply';
				id = block.ranges[ 1 ].id;
			}
		}

		if (
			'undefined' === typeof block.meta ||
			'undefined' === typeof block.meta.ids ||
			Object.keys( block.meta.ids ).length < 1
		) {
			return { type, id };
		}

		if ( 'undefined' !== typeof block.meta.ids.prompt ) {
			type = 'prompt';
			id = block.meta.ids.prompt;
		} else if ( 'undefined' !== typeof block.meta.ids.comment ) {
			type = 'comment';
			id = block.meta.ids.comment;
		} else if ( 'undefined' !== typeof block.meta.ids.post ) {
			type = 'post';
			id = block.meta.ids.post;
		} else if ( 'undefined' !== typeof block.meta.ids.user ) {
			type = 'user';
			id = block.meta.ids.user;
		}

		return { type, id };
	} );
}

export type NoteBodyParts = {
	/** Context blocks (post title, prompt text, user blocks, likers). */
	context: Block[];
	/** The quoted comment block, when the note carries one. */
	comment: Block | null;
	/** Blocks the payload places after the comment (e.g. "You replied to this comment."). */
	postscript: Block[];
};

/**
 * Split the note's non-empty body blocks around the comment block. Returns the
 * full classification — any presentation-side filtering (e.g. dropping user
 * blocks a header already covers) belongs in the consuming shell.
 */
export function getNoteBodyParts( note: Note ): NoteBodyParts {
	const blocks = ( note.body ?? [] ).filter( ( block ) => block.text && block.text.trim() );
	const commentIndex = blocks.findIndex( ( block ) => block.type === 'comment' );
	const commentBlock = commentIndex === -1 ? null : blocks[ commentIndex ];

	const context = commentIndex === -1 ? blocks : blocks.slice( 0, commentIndex );
	const postscript = commentIndex === -1 ? [] : blocks.slice( commentIndex + 1 );

	return { context, comment: commentBlock, postscript };
}

export type NoteUserRef = {
	name: string;
	avatarUrl: string | null;
	url: string | null;
	siteId: number | null;
	isFollowing: boolean;
	canFollow: boolean;
	homeTitle: string | null;
	homeUrl: string | null;
};

/** Identity bits of a body `user` block: name, avatar, links, and follow state. */
export function getNoteUserRef( block: Block ): NoteUserRef {
	const siteId = block.meta?.ids?.site ?? null;
	const homeUrl = block.meta?.links?.home ?? null;
	const homeTitle =
		block.meta?.titles?.home ??
		( homeUrl ? homeUrl.replace( /^https?:\/\//, '' ).replace( /\/$/, '' ) : null );

	return {
		name: block.text,
		avatarUrl: block.media?.find( ( media ) => media.type === 'image' )?.url ?? null,
		url: block.ranges?.find( ( range ) => range.type === 'user' && range.url )?.url ?? homeUrl,
		siteId,
		isFollowing: !! ( block.actions && 'follow' in block.actions && block.actions.follow ),
		canFollow: !! ( block.actions && siteId !== null ),
		homeTitle,
		homeUrl,
	};
}
