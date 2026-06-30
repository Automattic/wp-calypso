/**
 * Shared block-tree and string helpers used by the Jetpack AI Sidebar components.
 */

import type { BlockSnapshot } from '../components/block-ref';

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
