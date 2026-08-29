/**
 * Shared block-tree and string helpers used by the Jetpack AI Sidebar components.
 */

import type { BlockSnapshot } from '../components/block-ref';

export type BlockEditorStore = {
	getBlocks?: ( rootClientId?: string ) => BlockSnapshot[];
	getBlocksByName?: ( blockName: string ) => string[];
	__experimentalGetGlobalBlocksByName?: ( blockName: string ) => string[];
	getSelectedBlock?: () => BlockSnapshot | null;
	getSelectedBlockClientId?: () => string | null;
};

export type EditorPostId = number | string | null;

export type EditorStore = {
	getCurrentPostId?: () => EditorPostId | undefined;
	getCurrentPostType?: () => string | undefined;
	getRenderingMode?: () => string | undefined;
};

export type EditorContentSelection = {
	block: BlockSnapshot;
	clientId: string;
	postId: EditorPostId;
	postType: string;
};

const CONTENT_POST_TYPES = new Set( [ 'post', 'page' ] );

function normaliseEditorPostId( postId: EditorPostId | undefined ): EditorPostId {
	if ( typeof postId === 'number' ) {
		return postId > 0 ? postId : null;
	}
	if ( typeof postId === 'string' ) {
		const trimmedPostId = postId.trim();
		return trimmedPostId && trimmedPostId !== '0' ? trimmedPostId : null;
	}
	return null;
}

export function getEditorContentBlocks(
	blockEditor?: BlockEditorStore,
	editor?: EditorStore
): BlockSnapshot[] {
	if (
		! blockEditor?.getBlocks ||
		! CONTENT_POST_TYPES.has( editor?.getCurrentPostType?.() ?? '' )
	) {
		return [];
	}

	const [ postContentClientId ] =
		blockEditor.getBlocksByName?.( 'core/post-content' ) ??
		blockEditor.__experimentalGetGlobalBlocksByName?.( 'core/post-content' ) ??
		[];

	if ( postContentClientId ) {
		return blockEditor.getBlocks( postContentClientId );
	}

	return editor?.getRenderingMode?.() === 'template-locked' ? [] : blockEditor.getBlocks();
}

/** Flatten a block tree into a pre-order list, skipping nameless blocks. */
export function flattenBlocks( blocks: BlockSnapshot[] ): BlockSnapshot[] {
	const out: BlockSnapshot[] = [];
	const walk = ( items: BlockSnapshot[] ) => {
		items.forEach( ( block ) => {
			if ( ! block.name ) {
				return;
			}
			out.push( block );
			if ( Array.isArray( block.innerBlocks ) && block.innerBlocks.length > 0 ) {
				walk( block.innerBlocks );
			}
		} );
	};
	walk( blocks );
	return out;
}

export function getEditorContentSelection(
	blockEditor?: BlockEditorStore,
	editor?: EditorStore,
	rememberedClientId?: string
): EditorContentSelection | null {
	const postId = normaliseEditorPostId( editor?.getCurrentPostId?.() );
	const postType = editor?.getCurrentPostType?.();
	if ( ! postType || ! CONTENT_POST_TYPES.has( postType ) ) {
		return null;
	}

	const selectedClientId =
		blockEditor?.getSelectedBlockClientId?.() ??
		blockEditor?.getSelectedBlock?.()?.clientId ??
		rememberedClientId;
	if ( ! selectedClientId ) {
		return null;
	}

	const block = flattenBlocks( getEditorContentBlocks( blockEditor, editor ) ).find(
		( candidate ) => candidate.clientId === selectedClientId
	);
	if ( ! block ) {
		return null;
	}

	return {
		block,
		clientId: selectedClientId,
		postId,
		postType,
	};
}

/** Count occurrences of `needle` in `source` (overlapping matches counted). */
export function countOccurrences( source: string, needle: string ): number {
	if ( needle === '' ) {
		return 0;
	}
	let count = 0;
	let pos = 0;
	while ( true ) {
		const found = source.indexOf( needle, pos );
		if ( found === -1 ) {
			return count;
		}
		count++;
		pos = found + 1;
	}
}
