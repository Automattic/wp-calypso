import { getBlock, getBlockRootClientId, getBlocks } from '../../utils/editor-blocks';
import { attributesAlreadyMatch } from './already-applied';
import type { BlockData, ResolveClientId } from './types';
import type { EditorBlock } from '../../utils/editor-blocks';

/** A parent whose children are to take the order of `childClientIds`. */
export interface ReorderOperation {
	parentClientId: string;
	childClientIds: string[];
}

/**
 * The child orders that turn `current` into `requested`, deepest first, or
 * `null` when the request changes more than the order: a name, an attribute,
 * a child left out, repeated or unknown. Moving the existing children keeps
 * a structural parent in place, where replacing it is refused in content-only
 * editing; and since `replaceInnerBlocks` drops any child left out, the whole
 * subtree is checked before anything is written. An empty list, like an
 * empty or null attributes placeholder, asks for no change.
 */
export function getReorderOperations(
	current: EditorBlock,
	requested: BlockData,
	resolve: ResolveClientId
): ReorderOperation[] | null {
	if (
		( requested.name && requested.name !== current.name ) ||
		! attributesAlreadyMatch( current, requested )
	) {
		return null;
	}

	if ( ! requested.innerBlocks?.length ) {
		return [];
	}

	// A block that controls its own children keeps them out of its tree node (BSKY-1992).
	const currentChildren = getBlocks( current.clientId );

	if ( currentChildren.length !== requested.innerBlocks.length ) {
		return null;
	}

	const currentChildrenById = new Map(
		currentChildren.map( ( block ) => [ block.clientId, block ] )
	);
	const childClientIds: string[] = [];
	const operations: ReorderOperation[] = [];

	for ( const requestedChild of requested.innerBlocks ) {
		const clientId = requestedChild.clientId && resolve( requestedChild.clientId );
		const existingChild = clientId ? currentChildrenById.get( clientId ) : undefined;

		if ( ! existingChild || childClientIds.includes( existingChild.clientId ) ) {
			return null;
		}

		const childOperations = getReorderOperations( existingChild, requestedChild, resolve );

		if ( ! childOperations ) {
			return null;
		}

		operations.push( ...childOperations );
		childClientIds.push( existingChild.clientId );
	}

	if ( currentChildren.some( ( child, index ) => child.clientId !== childClientIds[ index ] ) ) {
		operations.push( { parentClientId: current.clientId, childClientIds } );
	}

	return operations;
}

/**
 * The reorder of the list holding an update's children when the update's own
 * id names no block. The agent addresses top-level reorders to a
 * `core/post-content` parent, which the post editor does not have: its content
 * blocks are the tree roots (AI-1133). The children must share one list,
 * cover it completely (`replaceInnerBlocks` drops any block left out), not
 * repeat (a repeat would put one block twice under a single clientId) and
 * carry no edit of their own, which a reorder could not apply; else `null`,
 * for the caller's usual not-found error. Attributes on the missing parent
 * are dropped: no block exists to carry them.
 */
export function getUnmappedParentReorder(
	update: BlockData,
	resolve: ResolveClientId
): ReorderOperation | null {
	if ( ! update.innerBlocks?.length ) {
		return null;
	}

	const children: EditorBlock[] = [];

	for ( const child of update.innerBlocks ) {
		const block = child.clientId ? getBlock( resolve( child.clientId ) ) : undefined;

		if (
			! block ||
			( child.name && child.name !== block.name ) ||
			Object.keys( child.attributes ?? {} ).length ||
			child.innerBlocks?.length
		) {
			return null;
		}

		children.push( block );
	}

	const parents = new Set(
		children.map( ( block ) => getBlockRootClientId( block.clientId ) ?? '' )
	);

	if ( parents.size !== 1 ) {
		return null;
	}

	const [ parentClientId ] = parents;
	const childClientIds = new Set( children.map( ( block ) => block.clientId ) );
	const currentList = getBlocks( parentClientId );

	if (
		childClientIds.size !== children.length ||
		currentList.length !== childClientIds.size ||
		! currentList.every( ( block ) => childClientIds.has( block.clientId ) )
	) {
		return null;
	}

	return { parentClientId, childClientIds: [ ...childClientIds ] };
}
