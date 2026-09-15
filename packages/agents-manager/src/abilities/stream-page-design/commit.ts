import { parse, serialize } from '@wordpress/blocks';
import { deepClone } from '../../utils/deep-clone';
import { sanitizeBlockTree, withSuppressedValidationLogs } from './block-markup';
import type { EditorBlock } from '../../utils/editor-blocks';
import type { Block } from '@wordpress/blocks';

interface CommitAdapters {
	/** The live blocks of the root the stream wrote into. */
	getLiveBlocks: () => EditorBlock[];
	/** The untracked write streaming used. */
	stageBlocks: ( blocks: EditorBlock[] ) => void;
	/** A tracked write, which records the one undo level. */
	replaceBlocks: ( blocks: EditorBlock[] ) => void;
	clearSelection: () => void;
}

const serializeBlocks = ( blocks: EditorBlock[] ): string =>
	withSuppressedValidationLogs( () => serialize( blocks as Block[] ) );

/**
 * Folds the streamed design into one native undo level, and reports whether
 * the page changed at all. Every frame was staged
 * untracked, so the entity still holds the pre-design content and no undo
 * level exists; re-writing the same final blocks records nothing, since the
 * editor skips a no-op write. So the pre-design blocks go back untracked, then
 * the final blocks are written tracked.
 *
 * The final payload is fresh copies of the live tree that keep the mounted
 * clientIds. Re-parsing the markup would mint new ids and orphan every block
 * mounted during the stream, whose queued per-block work would then throw.
 * Copies rather than the store's own references, so the editor sees a change.
 *
 * Not to be wrapped in a registry batch: the tracked write's change handler
 * runs synchronously inside it, and a batch would defer that past the return.
 */
export function commitStreamedPageDesign(
	adapters: CommitAdapters,
	beforeBlocks: EditorBlock[]
): boolean {
	const after = sanitizeBlockTree( deepClone( adapters.getLiveBlocks() ) );
	const before = sanitizeBlockTree( beforeBlocks );
	const beforeContent = serializeBlocks( before );

	// A repeated tool call re-emitting the same design changes nothing, and an
	// empty undo level would be its only trace.
	if ( beforeContent === serializeBlocks( after ) ) {
		return false;
	}

	// A fresh parse of the pre-design markup, which is what the entity's
	// tracked content holds.
	const beforeParsed = sanitizeBlockTree(
		withSuppressedValidationLogs( () => parse( beforeContent ) ) as EditorBlock[]
	);

	adapters.clearSelection();
	adapters.stageBlocks( beforeParsed );
	adapters.replaceBlocks( after );

	return true;
}
