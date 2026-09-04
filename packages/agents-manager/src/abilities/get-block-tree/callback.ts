import { select } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import type { AbilityResult } from '../types';

type EditorBlock = {
	clientId: string;
	name: string;
	attributes?: Record< string, unknown >;
	innerBlocks?: EditorBlock[];
};

type BlockTreeNode = {
	clientId: string;
	name: string;
	attributes: Record< string, unknown >;
	innerBlocks: BlockTreeNode[];
};

type BlockEditorSelectors = {
	getBlocks: ( clientId?: string ) => EditorBlock[];
	getSelectedBlockClientId: () => string | null;
};

function cloneAttributes( attributes: Record< string, unknown > | undefined ) {
	if ( ! attributes ) {
		return {};
	}

	return JSON.parse( JSON.stringify( attributes ) ) as Record< string, unknown >;
}

function readBlockTree(
	blocks: EditorBlock[],
	selectors: BlockEditorSelectors,
	visited: Set< string >
): { blocks: BlockTreeNode[]; count: number } {
	let count = 0;
	const result: BlockTreeNode[] = [];

	for ( const block of blocks ) {
		if ( ! block?.clientId || visited.has( block.clientId ) ) {
			continue;
		}

		visited.add( block.clientId );
		const children = selectors.getBlocks( block.clientId );
		const childTree = readBlockTree(
			children.length ? children : block.innerBlocks || [],
			selectors,
			visited
		);

		result.push( {
			clientId: block.clientId,
			name: block.name,
			attributes: cloneAttributes( block.attributes ),
			innerBlocks: childTree.blocks,
		} );
		count += childTree.count + 1;
	}

	return { blocks: result, count };
}

export async function getBlockTreeCallback(): Promise< AbilityResult > {
	try {
		const selectors = select( 'core/block-editor' ) as unknown as BlockEditorSelectors | undefined;
		if ( ! selectors?.getBlocks || ! selectors.getSelectedBlockClientId ) {
			throw new Error( 'The block editor data store is unavailable.' );
		}

		const tree = readBlockTree( selectors.getBlocks(), selectors, new Set() );
		return {
			result: {
				success: true,
				message: __( 'Read the current editor block tree.', __i18n_text_domain__ ),
				details: {
					selectedBlockClientId: selectors.getSelectedBlockClientId(),
					blockCount: tree.count,
					blocks: tree.blocks,
				},
			},
			returnToAgent: true,
		};
	} catch ( error ) {
		return {
			result: {
				success: false,
				message: __( 'Unable to read the current editor block tree.', __i18n_text_domain__ ),
				error: error instanceof Error ? error.message : String( error ),
			},
			returnToAgent: true,
		};
	}
}
