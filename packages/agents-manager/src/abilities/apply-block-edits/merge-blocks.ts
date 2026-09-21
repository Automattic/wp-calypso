import { createBlock } from '@wordpress/blocks';
import { isRecord } from '../../utils/is-record';
import type { BlockData, ResolveClientId } from './types';
import type { BlockAttributes, EditorBlock } from '../../utils/editor-blocks';
import type { Block } from '@wordpress/blocks';

function mergeValue( current: unknown, requested: unknown ): unknown {
	if ( requested === undefined ) {
		return current;
	}

	// `null` unsets: as `undefined`, since `updateBlockAttributes` keeps every
	// key it is not given, and `createBlock` treats the two alike.
	if ( requested === null ) {
		return undefined;
	}

	if ( ! isRecord( current ) || ! isRecord( requested ) ) {
		return requested;
	}

	return mergeAttributes( current, requested );
}

/**
 * The block's attributes with the requested ones merged in, nested objects
 * included. An empty object or nothing requests no change.
 */
export function mergeAttributes(
	current: BlockAttributes,
	requested: BlockAttributes | undefined
): BlockAttributes {
	if ( ! isRecord( requested ) ) {
		return current;
	}

	const merged = { ...current };

	for ( const [ key, value ] of Object.entries( requested ) ) {
		merged[ key ] = mergeValue( current[ key ], value );
	}

	return merged;
}

/**
 * The block as the update leaves it: attributes merged, and the children as
 * listed, an existing child by id keeping what the update does not touch, a
 * new one as sent. An empty or absent list keeps the children as they are.
 */
export function mergeBlocksRecursively(
	existing: EditorBlock,
	update: BlockData,
	resolve: ResolveClientId
): BlockData {
	const children = update.innerBlocks?.length
		? update.innerBlocks.map( ( child ) => {
				const clientId = child.clientId && resolve( child.clientId );
				const existingChild = existing.innerBlocks.find( ( block ) => block.clientId === clientId );

				return existingChild ? mergeBlocksRecursively( existingChild, child, resolve ) : child;
			} )
		: existing.innerBlocks;

	return {
		...existing,
		...update,
		attributes: mergeAttributes( existing.attributes, update.attributes ),
		innerBlocks: children,
	};
}

/** A block the editor can hold, built from the agent's data with its children. */
export function createBlockRecursively( block: BlockData ): Block {
	// Only a reference to a child that vanished mid-apply arrives nameless.
	if ( ! block.name ) {
		throw new Error( 'Block must have a name property' );
	}

	return createBlock(
		block.name,
		block.attributes,
		( block.innerBlocks ?? [] ).map( createBlockRecursively )
	);
}
