/**
 * The edits as the agent sends them, checked once and reshaped into
 * `BlockEdits`: every list an array of usable entries, every delete a string.
 */

import { getBlockTypes } from '@wordpress/blocks';
import { isRecord } from '../../utils/is-record';
import type { BlockData, BlockEdits, BlockInsert, BlockUpdate } from './types';

export interface RawBlockEdits {
	updates?: unknown;
	inserts?: unknown;
	deletes?: unknown;
	summary?: unknown;
	customCSS?: unknown;
}

// A lone object stands for a one-entry list: the wire may deliver `updates: { … }`.
// Nullish entries are dropped, since the model sends some (BSKY-950).
function toList( value: unknown, invalidMessage: string ): unknown[] {
	if ( value == null ) {
		return [];
	}

	if ( isRecord( value ) ) {
		return [ value ];
	}

	if ( ! Array.isArray( value ) ) {
		throw new Error( invalidMessage );
	}

	return value.filter( ( entry ) => entry != null );
}

// An existing block may carry any name, or none: the editor's own is what counts.
function assertBlock( value: unknown, availableNames: Set< string > ): asserts value is BlockData {
	if ( ! isRecord( value ) || ( ! value.name && ! value.clientId ) ) {
		throw new Error( 'Block must have a name property' );
	}

	if ( ! value.clientId && ! availableNames.has( String( value.name ) ) ) {
		throw new Error( `Block type "${ String( value.name ) }" is not available` );
	}

	if ( value.innerBlocks != null ) {
		if ( ! Array.isArray( value.innerBlocks ) ) {
			throw new Error( 'Inner blocks must be an array' );
		}

		value.innerBlocks.forEach( ( innerBlock ) => assertBlock( innerBlock, availableNames ) );
	}
}

function toUpdate( value: unknown, availableNames: Set< string > ): BlockUpdate {
	if ( ! isRecord( value ) ) {
		throw new Error( 'Updates must contain clientId and name' );
	}

	const { clientId, name } = value;

	if ( typeof clientId !== 'string' || ! clientId || typeof name !== 'string' || ! name ) {
		throw new Error( 'Updates must contain clientId and name' );
	}

	assertBlock( value, availableNames );

	return { ...value, clientId, name };
}

function toInsert( value: unknown, availableNames: Set< string > ): BlockInsert {
	if ( ! isRecord( value ) || ! isRecord( value.block ) || ! value.block.name ) {
		throw new Error( 'Insertions must contain block data with a name' );
	}

	const { parentClientId, index, block } = value;

	assertBlock( block, availableNames );

	return {
		...( typeof parentClientId === 'string' && { parentClientId } ),
		...( typeof index === 'number' && { index } ),
		block,
	};
}

// The model sometimes sends a delete as `{ clientId }`.
function toDelete( value: unknown ): string {
	const clientId = isRecord( value ) ? value.clientId : value;

	if ( typeof clientId !== 'string' || ! clientId ) {
		throw new Error( 'Each deletion must be a clientId string' );
	}

	return clientId;
}

/** Checks one call's edits and returns them as `BlockEdits`, leaving the input as it was. */
export function normalizeEdits( raw: RawBlockEdits ): BlockEdits {
	const updates = toList( raw.updates, 'Updates must be an array' );
	const inserts = toList( raw.inserts, 'Insertions must be an array' );
	const deletes = toList( raw.deletes, 'Deletions must be an array of clientIds' );

	if (
		raw.updates == null &&
		raw.inserts == null &&
		raw.deletes == null &&
		! raw.summary &&
		typeof raw.customCSS !== 'string'
	) {
		throw new Error(
			'Response must contain updates, insertions, deletions, custom CSS, or a summary message'
		);
	}

	const availableNames = new Set( getBlockTypes().map( ( blockType ) => blockType.name ) );

	return {
		updates: updates.map( ( update ) => toUpdate( update, availableNames ) ),
		inserts: inserts.map( ( insert ) => toInsert( insert, availableNames ) ),
		deletes: deletes.map( toDelete ),
		...( typeof raw.customCSS === 'string' && { customCSS: raw.customCSS } ),
	};
}

/** Whether the call asks for any block to change. */
export const hasRequestedBlockEdits = ( edits: BlockEdits ): boolean =>
	edits.updates.length > 0 || edits.inserts.length > 0 || edits.deletes.length > 0;
