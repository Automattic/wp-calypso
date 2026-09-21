/**
 * Whether the page already shows what an update asks for, so the call can
 * report no change instead of writing, and checkpointing, the same values.
 */

import { getBlock, getBlocks } from '../../utils/editor-blocks';
import { isRecord } from '../../utils/is-record';
import { sameJson } from '../../utils/same-json';
import { isUpdateOnly } from './normalize-edits';
import type { BlockData, BlockEdits, ResolveClientId } from './types';
import type { EditorBlock } from '../../utils/editor-blocks';

/**
 * Whether `current` already holds what `requested` asks for: every requested
 * key, at any depth. `null` asks for the value to go, so an absent one
 * already satisfies it.
 */
export function valueAlreadyMatches( current: unknown, requested: unknown ): boolean {
	if ( requested === undefined ) {
		return true;
	}

	if ( requested === null ) {
		return current == null;
	}

	if ( isRecord( requested ) ) {
		return (
			isRecord( current ) &&
			Object.entries( requested ).every( ( [ key, value ] ) =>
				valueAlreadyMatches( current[ key ], value )
			)
		);
	}

	return sameJson( current, requested );
}

/** Whether the block's attributes already hold what the update asks for, if it asks at all. */
export const attributesAlreadyMatch = ( current: EditorBlock, requested: BlockData ): boolean =>
	! isRecord( requested.attributes ) ||
	valueAlreadyMatches( current.attributes, requested.attributes );

// A name or attributes the update leaves out are already matched. An empty
// child list keeps the children as they are, as the apply does.
function blockAlreadyMatches(
	current: EditorBlock,
	requested: BlockData,
	resolve: ResolveClientId
): boolean {
	if ( requested.name && current.name !== requested.name ) {
		return false;
	}

	if ( ! attributesAlreadyMatch( current, requested ) ) {
		return false;
	}

	const children = requested.innerBlocks ?? [];

	if ( ! children.length ) {
		return true;
	}

	const currentChildren = getBlocks( current.clientId );

	return (
		currentChildren.length === children.length &&
		children.every( ( child, index ) => {
			const currentChild = currentChildren[ index ];

			return (
				( ! child.clientId || currentChild.clientId === resolve( child.clientId ) ) &&
				blockAlreadyMatches( currentChild, child, resolve )
			);
		} )
	);
}

/** Whether an update-only call asks for nothing the page does not already show. */
export function areUpdateEditsAlreadySatisfied(
	edits: BlockEdits,
	resolve: ResolveClientId
): boolean {
	if ( ! isUpdateOnly( edits ) ) {
		return false;
	}

	return edits.updates.every( ( update ) => {
		const block = getBlock( resolve( update.clientId ) );

		return !! block && blockAlreadyMatches( block, update, resolve );
	} );
}
