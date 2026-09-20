import { assertCanvasUnmoved } from '../../utils/canvas-guard';
import {
	getBlock,
	getBlockParents,
	getBlockRootClientId,
	getBlocks,
	insertBlock,
	removeBlock,
	replaceBlock,
	replaceInnerBlocks,
	resolveBlocksRoot,
	TEMPLATE_PART_BLOCK,
	updateBlockAttributes,
} from '../../utils/editor-blocks';
import { NAVIGATION_BLOCK } from '../../utils/navigation-menu';
import { syncCoverWithImage } from './cover-image';
import { createBlockRecursively, mergeAttributes, mergeBlocksRecursively } from './merge-blocks';
import { getReorderOperations, getUnmappedParentReorder } from './reorder';
import type { ReorderOperation } from './reorder';
import type { BlockData, BlockEdits, BlockInsert, BlockUpdate, ResolveClientId } from './types';
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

// Parents whose children move in place: replacing them is refused in
// content-only editing, and a menu's items live in its record.
const REPLACE_INNER_BLOCKS_STRUCTURAL_PARENTS = new Set( [
	POST_CONTENT_BLOCK_NAME,
	TEMPLATE_PART_BLOCK,
	NAVIGATION_BLOCK,
	'core/columns',
] );

const wait = ( ms: number ) => new Promise< void >( ( resolve ) => setTimeout( resolve, ms ) );

// Every write checks the canvas first, before the undo level marks anything:
// the batch yields between steps, and the user may leave the page while it does.
const createWriters = ( level: UndoLevel ) => {
	const guarded = < Args extends unknown[] >( write: ( ...args: Args ) => void ) => {
		const inLevel = level.write( write );

		return ( ...args: Args ) => {
			assertCanvasUnmoved();
			inLevel( ...args );
		};
	};

	return {
		insert: guarded( insertBlock ),
		remove: guarded( removeBlock ),
		replace: guarded( replaceBlock ),
		replaceChildren: guarded( replaceInnerBlocks ),
		updateAttributes: guarded( updateBlockAttributes ),
	};
};

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
	// The page's root, as the checkpoint snapshots it.
	if ( ! parentClientId ) {
		const root = resolveBlocksRoot();

		if ( ! root ) {
			throw new Error( '[Edit Blocks] The editor has no page open to insert into.' );
		}

		return root.kind === 'document' ? undefined : root.clientId;
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

async function applyUpdate(
	update: BlockUpdate,
	options: ApplyEditsOptions,
	writers: Writers,
	recoveredTargetIds: Set< string >
): Promise< void > {
	const { resolve, onReplaced } = options;
	const { clientId: requestedId, ...blockData } = update;
	const clientId = resolve( requestedId );
	const target = getBlock( clientId );

	if ( ! target ) {
		const recovery =
			requestedId === POST_CONTENT_BLOCK_NAME &&
			update.name === POST_CONTENT_BLOCK_NAME &&
			getUnmappedParentReorder( update, resolve );

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

		// The list moves the children as they are; the edits they carry follow.
		for ( const [ index, child ] of innerBlocks.entries() ) {
			const name = child.name ?? children[ index ].name;

			if (
				name !== children[ index ].name ||
				Object.keys( child.attributes ?? {} ).length ||
				child.innerBlocks?.length
			) {
				await applyUpdate(
					{ ...child, clientId: children[ index ].clientId, name },
					options,
					writers,
					recoveredTargetIds
				);
			}
		}
	} else {
		let holder = clientId;

		// A block keeps its instance for an attribute change; a type change
		// needs a new one.
		if ( ! innerBlocks.length && blockData.name === target.name ) {
			writers.updateAttributes(
				clientId,
				mergeAttributes( target.attributes, blockData.attributes )
			);
		} else {
			const created = createBlockRecursively(
				mergeBlocksRecursively( target, blockData, resolve )
			);

			writers.replace( clientId, created );
			onReplaced( requestedId, created.clientId );
			await followReplacedChildren(
				target.innerBlocks,
				blockData.innerBlocks,
				created.innerBlocks,
				options,
				writers
			);
			holder = created.clientId;
		}

		await syncCoverWithImage( holder, target, blockData.attributes, writers.updateAttributes );
	}
}

/**
 * A replaced block's children are recreated with new clientIds: the ids the
 * call knows them by follow, and a cover among them is synced like the parent.
 */
async function followReplacedChildren(
	before: EditorBlock[],
	requested: BlockData[] | null | undefined,
	created: EditorBlock[],
	options: ApplyEditsOptions,
	writers: Writers
): Promise< void > {
	const { resolve, onReplaced } = options;
	const listed: BlockData[] = requested?.length
		? requested
		: before.map( ( { clientId } ) => ( { clientId } ) );

	for ( const [ index, child ] of listed.entries() ) {
		const block = created[ index ];
		const previous =
			child.clientId && before.find( ( { clientId } ) => clientId === resolve( child.clientId! ) );

		if ( ! child.clientId || ! block || ! previous ) {
			continue;
		}

		onReplaced( child.clientId, block.clientId );
		await syncCoverWithImage(
			block.clientId,
			previous,
			child.attributes,
			writers.updateAttributes
		);
		await followReplacedChildren(
			previous.innerBlocks,
			child.innerBlocks,
			block.innerBlocks,
			options,
			writers
		);
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
		await applyUpdate( update, options, writers, recoveredTargetIds );
	}

	for ( const requestedId of edits.deletes ) {
		await applyDelete( requestedId, resolve, writers );
	}

	// The last write yields before this returns.
	assertCanvasUnmoved();

	return { recoveredTargetIds, insertedClientIds };
}
