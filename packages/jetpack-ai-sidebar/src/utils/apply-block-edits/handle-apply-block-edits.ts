/**
 * Client handler for the bundled `big-sky/apply-block-edits` fallback ability.
 *
 * Applies a batch of block updates / insertions / deletions to the Gutenberg
 * editor. Mirrors the behaviour of Big Sky's canonical apply-block-edits tool
 * for the block-content-editing subset: no custom-CSS / global-styles staging
 * and no contentOnly-section unlocking.
 *
 * Editor access goes through the `window.wp.data` / `window.wp.blocks` runtime
 * globals (matching this package's `block-actions.ts` convention) rather than
 * static `@wordpress/*` imports, so the handler targets the host editor's
 * singleton stores and adds no bundled dependency.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { __ } from '@wordpress/i18n';
import {
	createBlockRecursively,
	mergeBlocksRecursively,
	normalizeBlockEdits,
	resolveClientId,
	validateBlockEdits,
	type CreateBlock,
	type EditorBlock,
	type NormalizedBlockEdits,
} from './block-edits';
import type { ApplyBlockEditsArgs, ApplyBlockEditsResult } from './types';

// `core/post-content` and `core/template-part` are controlled blocks: their
// children are entity-backed and `replaceBlock` is silently a no-op on them, so
// inner-block changes must go through `replaceInnerBlocks` instead.
const CONTROLLED_INNER_BLOCK_PARENTS = new Set( [ 'core/post-content', 'core/template-part' ] );

interface BlockEditorSelect {
	getBlock: ( clientId: string ) => EditorBlock | null;
	getBlockParents: ( clientId: string ) => string[];
	getBlocks: () => EditorBlock[];
}

interface BlockEditorDispatch {
	insertBlock: ( block: any, index?: number, rootClientId?: string ) => void;
	removeBlock: ( clientId: string ) => void;
	replaceBlock: ( clientId: string, block: any ) => void;
	replaceInnerBlocks: ( rootClientId: string, blocks: any[] ) => void;
	updateBlockAttributes: ( clientId: string, attributes: Record< string, unknown > ) => void;
}

function failure( message: string, error?: string ): ApplyBlockEditsResult {
	return { result: { success: false, message, error }, returnToAgent: true };
}

async function applyEdits(
	edits: NormalizedBlockEdits,
	reverseMap: Record< string, string >,
	select: BlockEditorSelect,
	dispatch: BlockEditorDispatch,
	createBlock: CreateBlock
): Promise< void > {
	const { getBlock, getBlockParents } = select;

	// Inserts first: doing updates first would churn clientIds and break inserts.
	for ( const insert of edits.inserts ) {
		const originalParentClientId = resolveClientId( insert.parentClientId, reverseMap );

		if ( insert.parentClientId && ! originalParentClientId ) {
			throw new Error( __( 'Could not resolve the parent block for an insertion.', 'jetpack' ) );
		}

		if ( originalParentClientId && ! getBlock( originalParentClientId ) ) {
			throw new Error( __( 'The parent block for an insertion was not found.', 'jetpack' ) );
		}

		const validBlock = await createBlockRecursively( insert.block, createBlock );
		dispatch.insertBlock(
			validBlock,
			typeof insert.index === 'number' ? insert.index : 0,
			originalParentClientId
		);
	}

	// Updates deepest-first, so replacing an outer block does not invalidate the
	// clientIds of inner blocks still queued for update.
	const clientIdDepth = new Map< string, number >();
	for ( const update of edits.updates ) {
		const originalClientId = resolveClientId( update.clientId, reverseMap );
		clientIdDepth.set(
			update.clientId,
			originalClientId ? getBlockParents( originalClientId )?.length ?? 0 : 0
		);
	}
	const updates = [ ...edits.updates ].sort(
		( a, b ) => ( clientIdDepth.get( b.clientId ) ?? 0 ) - ( clientIdDepth.get( a.clientId ) ?? 0 )
	);

	for ( const update of updates ) {
		const { clientId, ...blockData } = update;
		const originalClientId = resolveClientId( clientId, reverseMap );

		if ( ! originalClientId ) {
			throw new Error( __( 'Could not resolve a block to update.', 'jetpack' ) );
		}

		const targetBlock = getBlock( originalClientId );
		if ( ! targetBlock ) {
			throw new Error( __( 'A block to update was not found.', 'jetpack' ) );
		}

		const mergedBlockData = mergeBlocksRecursively( targetBlock, blockData, reverseMap, getBlock );
		const hasInnerBlockChanges =
			Array.isArray( blockData.innerBlocks ) && blockData.innerBlocks.length > 0;

		if ( hasInnerBlockChanges ) {
			const validBlock = await createBlockRecursively( mergedBlockData, createBlock );

			if ( CONTROLLED_INNER_BLOCK_PARENTS.has( targetBlock.name ) ) {
				dispatch.updateBlockAttributes( originalClientId, validBlock.attributes || {} );
				dispatch.replaceInnerBlocks( originalClientId, validBlock.innerBlocks || [] );
			} else {
				dispatch.replaceBlock( originalClientId, validBlock );
				reverseMap[ clientId ] = validBlock.clientId;
			}
		} else {
			dispatch.updateBlockAttributes( originalClientId, mergedBlockData.attributes || {} );
		}
	}

	// Deletes deepest-first for the same reason as updates.
	const deletes = [ ...edits.deletes ].sort( ( a, b ) => {
		const originalA = resolveClientId( a, reverseMap );
		const originalB = resolveClientId( b, reverseMap );
		return (
			( originalB ? getBlockParents( originalB )?.length ?? 0 : 0 ) -
			( originalA ? getBlockParents( originalA )?.length ?? 0 : 0 )
		);
	} );

	for ( const clientId of deletes ) {
		const originalClientId = resolveClientId( clientId, reverseMap );

		if ( ! originalClientId ) {
			throw new Error( __( 'Could not resolve a block to delete.', 'jetpack' ) );
		}

		if ( ! getBlock( originalClientId ) ) {
			throw new Error( __( 'A block to delete was not found.', 'jetpack' ) );
		}

		dispatch.removeBlock( originalClientId );
	}
}

export async function handleApplyBlockEdits(
	input: ApplyBlockEditsArgs
): Promise< ApplyBlockEditsResult > {
	const wpData = ( window as any ).wp?.data;
	const wpBlocks = ( window as any ).wp?.blocks;

	if ( ! wpData || ! wpBlocks ) {
		return failure(
			__( 'The editor is not ready yet. Try the block edit again in a moment.', 'jetpack' ),
			'Block editor stores are unavailable.'
		);
	}

	// Custom CSS / global-styles editing is intentionally out of scope for this
	// surface. Refuse it explicitly rather than silently dropping the request so
	// the agent can report back to the user instead of claiming success.
	if ( typeof input.customCSS === 'string' && input.customCSS.trim() ) {
		return failure(
			__( 'Editing custom CSS or global styles is not supported in this editor.', 'jetpack' ),
			'customCSS is not supported.'
		);
	}

	try {
		const select: BlockEditorSelect = wpData.select( 'core/block-editor' );
		const dispatch: BlockEditorDispatch = wpData.dispatch( 'core/block-editor' );
		const createBlock: CreateBlock = wpBlocks.createBlock;

		const edits = normalizeBlockEdits( input );
		const availableBlocks = new Set< string >(
			( wpBlocks.getBlockTypes() || [] ).map( ( blockType: any ) => blockType.name )
		);
		validateBlockEdits( edits, availableBlocks );

		const reverseMap = input.reverseMap || {};
		const before = JSON.stringify( select.getBlocks() );

		await applyEdits( edits, reverseMap, select, dispatch, createBlock );

		const after = JSON.stringify( select.getBlocks() );
		if ( before === after ) {
			return failure(
				__(
					'I was not able to make the requested changes. You can ask me to try again or to do something else.',
					'jetpack'
				),
				'No block changes were detected after applying edits.'
			);
		}

		return {
			result: {
				success: true,
				message: edits.summary || __( 'I have applied the requested block edits.', 'jetpack' ),
			},
			returnToAgent: true,
		};
	} catch ( error ) {
		return failure(
			__( 'Something went wrong while applying the block edits. Please try again.', 'jetpack' ),
			error instanceof Error ? error.message : String( error )
		);
	}
}
