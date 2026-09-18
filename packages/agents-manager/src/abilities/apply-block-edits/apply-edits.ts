import {
	getBlock,
	getBlockParents,
	getBlockRootClientId,
	getBlocks,
	getSectionRootClientId,
	insertBlock,
	removeBlock,
	replaceBlock,
	replaceInnerBlocks,
	TEMPLATE_PART_BLOCK,
	updateBlockAttributes,
} from '../../utils/editor-blocks';
import { createBlockRecursively, mergeAttributes, mergeBlocksRecursively } from './merge-blocks';
import { getReorderOperations, getUnmappedParentReorder } from './reorder';
import type { ReorderOperation } from './reorder';
import type { BlockEdits, BlockInsert, BlockUpdate, ResolveClientId } from './types';
import type { EditorBlock, UndoLevel } from '../../utils/editor-blocks';

export interface ApplyEditsOptions {
	resolve: ResolveClientId;
	/** Told when a block is replaced, so `resolve` can follow it to its new clientId. */
	onReplaced: ( requestedId: string, clientId: string ) => void;
	/** The undo level every write lands in. */
	level: UndoLevel;
}

interface ApplyEditsResult {
	/** Requested ids the unmapped-parent recovery applied, so they are not reported as unresolved. */
	recoveredTargetIds: Set< string >;
	/** The clientIds of the blocks inserted, for the capture to frame. */
	insertedClientIds: string[];
}

const POST_CONTENT_BLOCK_NAME = 'core/post-content';

// Parents whose children move in place: replacing them is refused in content-only editing.
const REPLACE_INNER_BLOCKS_STRUCTURAL_PARENTS = new Set( [
	POST_CONTENT_BLOCK_NAME,
	TEMPLATE_PART_BLOCK,
	'core/columns',
] );

const wait = ( ms: number ) => new Promise< void >( ( resolve ) => setTimeout( resolve, ms ) );

const createWriters = ( level: UndoLevel ) => ( {
	insert: level.write( insertBlock ),
	remove: level.write( removeBlock ),
	replace: level.write( replaceBlock ),
	replaceChildren: level.write( replaceInnerBlocks ),
	updateAttributes: level.write( updateBlockAttributes ),
} );

type Writers = ReturnType< typeof createWriters >;

function requireBlock( clientId: string ): EditorBlock {
	const block = getBlock( clientId );

	if ( ! block ) {
		throw new Error( `[Edit Blocks] Block not found with clientId: ${ clientId }` );
	}

	return block;
}

// Reads each list as it is written, so replacing an ancestor's list cannot
// restore a stale order of descendants.
const applyReorders = ( operations: ReorderOperation[], writers: Writers ): void =>
	operations.forEach( ( { parentClientId, childClientIds } ) =>
		writers.replaceChildren( parentClientId, childClientIds.map( requireBlock ) )
	);

function resolveInsertParent(
	parentClientId: string | null | undefined,
	resolve: ResolveClientId
): string | undefined {
	if ( ! parentClientId ) {
		return getSectionRootClientId();
	}

	const parent = resolve( parentClientId );

	if ( ! getBlock( parent ) ) {
		throw new Error( `[Edit Pattern] Parent block not found with clientId: ${ parent }` );
	}

	return parent;
}

/**
 * Restricted block lists (content-only editing, section roots that take only
 * content blocks) drop an `insertBlock` as a silent no-op where
 * `replaceInnerBlocks` is still allowed, so the block is spliced into the
 * parent's list instead. A list that reads back empty is left alone: splicing
 * into it would replace every child with the new block (BSKY-1992).
 */
async function insertBySplicing(
	parent: string,
	index: number,
	block: EditorBlock,
	childrenBefore: number,
	writers: Writers
): Promise< void > {
	const children = getBlocks( parent );

	if ( ! children.length && childrenBefore ) {
		// eslint-disable-next-line no-console
		console.error(
			'[AgentsManager] Skipping insert fallback: the parent block list read back empty',
			{ parentClientId: parent, childrenBefore }
		);

		return;
	}

	const nextChildren = [ ...children ];

	nextChildren.splice( index, 0, block );
	writers.replaceChildren( parent, nextChildren );
	await wait( 0 );
}

/** Inserts the block and resolves to its clientId, or `undefined` when it did not land. */
async function applyInsert(
	{ parentClientId, index = 0, block }: BlockInsert,
	resolve: ResolveClientId,
	writers: Writers
): Promise< string | undefined > {
	const parent = resolveInsertParent( parentClientId, resolve );
	const childrenBefore = parent ? getBlocks( parent ).length : 0;
	const created = createBlockRecursively( block );

	// Without this delay nested `innerBlocks` are not reliably part of the insert.
	await wait( 200 );
	writers.insert( created, index, parent );
	await wait( 0 );

	if ( parent && ! getBlock( created.clientId ) ) {
		await insertBySplicing( parent, index, created, childrenBefore, writers );
	}

	return getBlock( created.clientId )?.clientId;
}

function applyUpdate(
	update: BlockUpdate,
	{ resolve, onReplaced }: ApplyEditsOptions,
	writers: Writers,
	recoveredTargetIds: Set< string >
): void {
	const { clientId: requestedId, ...blockData } = update;
	const clientId = resolve( requestedId );
	const target = getBlock( clientId );

	if ( ! target ) {
		const recovery =
			requestedId === POST_CONTENT_BLOCK_NAME && getUnmappedParentReorder( update, resolve );

		if ( recovery ) {
			applyReorders( [ recovery ], writers );
			recoveredTargetIds.add( requestedId );

			return;
		}

		throw new Error( `[Edit Blocks] Block not found with clientId: ${ clientId }` );
	}

	const innerBlocks = blockData.innerBlocks ?? [];
	const reorderOperations = innerBlocks.length
		? getReorderOperations( target, blockData, resolve )
		: null;

	if ( reorderOperations ) {
		applyReorders( reorderOperations, writers );
	} else if ( REPLACE_INNER_BLOCKS_STRUCTURAL_PARENTS.has( target.name ) && innerBlocks.length ) {
		// The parent's own attributes travel with the reorder.
		if ( Object.keys( blockData.attributes ?? {} ).length ) {
			writers.updateAttributes(
				clientId,
				mergeAttributes( target.attributes, blockData.attributes )
			);
		}

		const children = innerBlocks.map( ( child ) => {
			const block = child.clientId ? getBlock( resolve( child.clientId ) ) : undefined;

			if ( ! block ) {
				throw new Error(
					`[Edit Blocks] Could not find post content child block for reordering: ${ child.clientId }`
				);
			}

			return block;
		} );

		writers.replaceChildren( clientId, children );
	} else if ( ! innerBlocks.length ) {
		// Keeps the block instance, which re-renders in place.
		writers.updateAttributes(
			clientId,
			mergeAttributes( target.attributes, blockData.attributes )
		);
	} else {
		const created = createBlockRecursively( mergeBlocksRecursively( target, blockData, resolve ) );

		writers.replace( clientId, created );
		onReplaced( requestedId, created.clientId );
	}
}

/**
 * Restricted block lists can drop `removeBlock` as a silent no-op; the block
 * is then taken out of its parent's list instead. A parent that cannot be
 * read is left alone: a list rebuilt from an empty read would delete the
 * siblings too.
 */
async function removeBySplicing( clientId: string, writers: Writers ): Promise< void > {
	const parent = getBlockRootClientId( clientId );
	const siblings = parent ? getBlocks( parent ) : [];
	const remaining = siblings.filter( ( block ) => block.clientId !== clientId );

	if ( ! parent || ! siblings.length ) {
		// eslint-disable-next-line no-console
		console.error(
			'[AgentsManager] Skipping delete fallback: could not read the parent block list',
			{ clientId, parentClientId: parent }
		);
	} else if ( remaining.length !== siblings.length ) {
		writers.replaceChildren( parent, remaining );
		await wait( 0 );
	}
}

async function applyDelete(
	requestedId: string,
	resolve: ResolveClientId,
	writers: Writers
): Promise< void > {
	const clientId = resolve( requestedId );

	if ( ! getBlock( clientId ) ) {
		// eslint-disable-next-line no-console
		console.error( '[AgentsManager] Block not found for deletion with clientId:', clientId );

		return;
	}

	writers.remove( clientId );
	await wait( 0 );

	if ( getBlock( clientId ) ) {
		await removeBySplicing( clientId, writers );
	}
}

// Inner blocks first: replacing an outer block changes its children's clientIds.
function deepestFirst( updates: BlockUpdate[], resolve: ResolveClientId ): BlockUpdate[] {
	const depth = new Map(
		updates.map( ( update ) => [ update, getBlockParents( resolve( update.clientId ) ).length ] )
	);

	return [ ...updates ].sort( ( a, b ) => ( depth.get( b ) ?? 0 ) - ( depth.get( a ) ?? 0 ) );
}

/**
 * Writes the edits into the editor: inserts first, since an update can change
 * the clientIds an insert names, then updates, then deletes.
 */
export async function applyEdits(
	edits: BlockEdits,
	options: ApplyEditsOptions
): Promise< ApplyEditsResult > {
	const { resolve } = options;
	const writers = createWriters( options.level );
	const recoveredTargetIds = new Set< string >();
	const insertedClientIds: string[] = [];

	for ( const blockInsert of edits.inserts ) {
		const clientId = await applyInsert( blockInsert, resolve, writers );

		if ( clientId ) {
			insertedClientIds.push( clientId );
		}
	}

	for ( const update of deepestFirst( edits.updates, resolve ) ) {
		applyUpdate( update, options, writers, recoveredTargetIds );
	}

	for ( const requestedId of edits.deletes ) {
		await applyDelete( requestedId, resolve, writers );
	}

	return { recoveredTargetIds, insertedClientIds };
}
