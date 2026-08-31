import type { Block, Note } from './types';

/**
 * Returns last block in list of blocks with 'actions' property
 */
function getActionBlock( blocks: Block[] ): Block {
	return (
		blocks.filter( ( block ) => block.hasOwnProperty( 'actions' ) ).slice( -1 )[ 0 ] ||
		( {} as Block )
	);
}

/**
 * Returns an object specifying which actions are enabled for a note and their values
 */
export function getActions( note: Note ): Record< string, unknown > {
	return ( getActionBlock( note.body ).actions ?? {} ) as Record< string, unknown >;
}

/**
 * Returns an id for a type of reference in a note or null
 * @param note - the note
 * @param type - can be 'post', 'comment', 'site', etc...
 */
export function getReferenceId( note: Note, type: string ): number | null {
	const ids = note.meta?.ids as Record< string, number | undefined > | undefined;
	if ( ! ids || ! ids[ type ] ) {
		return null;
	}

	return ids[ type ] ?? null;
}

/**
 * Returns the edit link for the note comment.
 * It's a Calypso link for WP.com sites and
 * Jetpack sites with the `edit_links_calypso_redirect` option set.
 * It's a wp-admin link otherwise.
 */
export function getEditCommentLink( note: Note ): string | undefined {
	return getActionBlock( note.body ).edit_comment_link;
}

/**
 * Returns the new post link for the note post.
 */
export function getNewPostLink( note: Note ): string | undefined {
	return getActionBlock( note.body ).new_post_link;
}

export type AvailableNoteActions = {
	replyToComment: boolean;
	likePost: boolean;
	likeComment: boolean;
	approveComment: boolean;
	spamComment: boolean;
	trashComment: boolean;
	editComment: boolean;
	answerPromptHref: string | null;
	follow: { siteId: number; isFollowing: boolean } | null;
};

/**
 * Which actions this note supports, derived from the payload the same way the
 * popup's actions pane does: the last body block carrying an `actions` object,
 * plus follow from a user block on non-comment notes.
 */
export function getAvailableNoteActions( note: Note ): AvailableNoteActions {
	const raw = getActions( note );
	const has = ( key: string ) => key in raw;

	let follow: AvailableNoteActions[ 'follow' ] = null;
	if ( note.type !== 'comment' ) {
		for ( const block of note.body ?? [] ) {
			const siteId = block.meta?.ids?.site;
			if ( siteId && block.actions && 'follow' in block.actions ) {
				follow = { siteId, isFollowing: !! block.actions.follow };
				break;
			}
		}
	}

	return {
		replyToComment: has( 'replyto-comment' ),
		likePost: has( 'like-post' ),
		likeComment: has( 'like-comment' ),
		approveComment: has( 'approve-comment' ),
		spamComment: has( 'spam-comment' ),
		trashComment: has( 'trash-comment' ),
		editComment: has( 'edit-comment' ),
		answerPromptHref: has( 'answer-prompt' ) ? String( raw[ 'answer-prompt' ] ) : null,
		follow,
	};
}
