/**
 * Shared draft assist constraints.
 *
 * The sidebar suggestion (`index.ts`) and the
 * `jetpack-ai/apply-draft-content` handler (`utils/apply-draft-content.ts`) must
 * agree on which posts draft assist may touch — offering it on a post the
 * handler then refuses reads as a broken button. The handler cannot
 * infer it from the entry point: the ability is registered for the whole editor
 * surface, and in the site editor `core/editor` serves templates and template
 * parts — where writing article prose would change the site, not a post.
 */

import type { DraftAssistContentType } from './tracking';

/** Editor post types draft assist applies to. */
export const DRAFT_ASSIST_POST_TYPES: readonly DraftAssistContentType[] = [ 'post', 'page' ];

/**
 * Whether draft assist may act on the given post type.
 * @param postType - Value from `core/editor`'s `getCurrentPostType()`.
 * @returns Whether the post type is one draft assist supports.
 */
export function isDraftAssistPostType( postType: unknown ): postType is DraftAssistContentType {
	return (
		typeof postType === 'string' &&
		( DRAFT_ASSIST_POST_TYPES as readonly string[] ).includes( postType )
	);
}

/** A paragraph with no text — what an untouched canvas is made of. */
function isBlankParagraph( block: unknown ): boolean {
	const { name, attributes } = ( block ?? {} ) as {
		name?: unknown;
		attributes?: { content?: unknown };
	};

	if ( name !== 'core/paragraph' ) {
		return false;
	}

	// Plain string on older editors, a RichText value object since WP 6.1.
	const content = attributes?.content;
	const text = typeof content === 'string' ? content : ( content as { text?: unknown } )?.text;

	return text == null || ( typeof text === 'string' && text.trim() === '' );
}

/**
 * Whether the post holds nothing the writer would mind losing.
 *
 * `isEditedPostEmpty()` allows zero blocks or one empty default block, so
 * pressing Enter twice on a blank post makes it "non-empty" — and the draft was
 * refused against a visibly empty screen. Fall back to the blocks: all-blank
 * paragraphs is empty. Any real text, or any other block type, is content.
 *
 * Reads through the host's `wp.data`, so a bundle loaded outside the editor
 * answers `false` rather than throwing.
 * @returns Whether a draft may be written into the post.
 */
export function isPostEffectivelyEmpty(): boolean {
	try {
		const select = ( window as any ).wp?.data?.select;
		if ( typeof select !== 'function' ) {
			return false;
		}

		if ( select( 'core/editor' )?.isEditedPostEmpty?.() === true ) {
			return true;
		}

		const blocks = select( 'core/block-editor' )?.getBlocks?.();

		// An unreadable block list counts as content: refusing costs a retry,
		// overwriting costs the user their words.
		if ( ! Array.isArray( blocks ) || blocks.length === 0 ) {
			return false;
		}

		return blocks.every( isBlankParagraph );
	} catch {
		return false;
	}
}
