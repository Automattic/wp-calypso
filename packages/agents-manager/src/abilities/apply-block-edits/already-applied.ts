/**
 * Whether the page already shows what an update asks for, so the call can
 * report no change instead of writing, and checkpointing, the same values.
 */

import { getBlock, getBlocks } from '../../utils/editor-blocks';
import { isRecord } from '../../utils/is-record';
import { sameJson } from '../../utils/same-json';
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

// An empty list keeps the children as they are, as the apply does.
function innerBlocksAlreadyMatch(
	current: EditorBlock[],
	requested: BlockData[],
	resolve: ResolveClientId
): boolean {
	if ( requested.length === 0 ) {
		return true;
	}

	if ( current.length !== requested.length ) {
		return false;
	}

	return requested.every( ( requestedBlock, index ) => {
		const currentBlock = current[ index ];

		if ( requestedBlock.clientId && currentBlock.clientId !== resolve( requestedBlock.clientId ) ) {
			return false;
		}

		if ( requestedBlock.name && currentBlock.name !== requestedBlock.name ) {
			return false;
		}

		if (
			isRecord( requestedBlock.attributes ) &&
			! valueAlreadyMatches( currentBlock.attributes, requestedBlock.attributes )
		) {
			return false;
		}

		return (
			! Array.isArray( requestedBlock.innerBlocks ) ||
			innerBlocksAlreadyMatch(
				getBlocks( currentBlock.clientId ),
				requestedBlock.innerBlocks,
				resolve
			)
		);
	} );
}

/** Whether an update-only call asks for nothing the page does not already show. */
export function areUpdateEditsAlreadySatisfied(
	edits: BlockEdits,
	resolve: ResolveClientId
): boolean {
	if ( ! edits.updates.length || edits.inserts.length || edits.deletes.length ) {
		return false;
	}

	return edits.updates.every( ( update ) => {
		const clientId = resolve( update.clientId );
		const block = getBlock( clientId );

		if ( ! block || block.name !== update.name ) {
			return false;
		}

		if (
			isRecord( update.attributes ) &&
			! valueAlreadyMatches( block.attributes, update.attributes )
		) {
			return false;
		}

		return (
			! Array.isArray( update.innerBlocks ) ||
			innerBlocksAlreadyMatch( getBlocks( clientId ), update.innerBlocks, resolve )
		);
	} );
}
