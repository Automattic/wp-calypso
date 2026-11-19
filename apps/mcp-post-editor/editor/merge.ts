// A post as the merge sees it: the title, and each top-level block serialized.
export type MergePost = { title: string; blocks: string[] };

const sameBlocks = ( a: string[], b: string[] ) =>
	a.length === b.length && a.every( ( block, i ) => block === b[ i ] );

// Puts `edits` into `target`. Each edit is the block `edits[ i ]` that replaced `base[ i ]`, and
// lands where `base[ i ]` is in `target`: the first copy not yet matched, from the last match on
// so duplicate blocks match their own copy, or else earlier, where the server moved it. When
// `target` no longer has `base[ i ]`, the edit lands on a block that already equals it, or else
// on `ours( i )`. `keepUnmatched` inserts any other edit after the last match, so it isn't lost;
// otherwise that edit is dropped.
function applyEdits(
	base: string[],
	edits: string[],
	target: string[],
	keepUnmatched: boolean,
	ours: ( i: number ) => string[] = () => []
) {
	const result = [ ...target ];
	const used = new Set< number >();
	const inserts: [ number, string ][] = [];
	let position = 0;
	const find = ( matches: ( block: string ) => boolean ) => {
		const free = ( j: number ) => ! used.has( j ) && matches( result[ j ] );
		const next = result.findIndex( ( block, j ) => j >= position && free( j ) );
		return next >= 0 ? next : result.findIndex( ( block, j ) => free( j ) );
	};
	base.forEach( ( block, i ) => {
		let found = find( ( other ) => other === block );
		if ( found < 0 && edits[ i ] !== block ) {
			found = find( ( other ) => other === edits[ i ] );
			if ( found < 0 ) {
				found = find( ( other ) => ours( i ).includes( other ) );
			}
		}
		if ( found >= 0 ) {
			result[ found ] = edits[ i ];
			used.add( found );
			position = found + 1;
		} else if ( keepUnmatched && edits[ i ] !== block ) {
			inserts.push( [ position, edits[ i ] ] );
		}
	} );
	// From the end, so each index still points where it did; the same index keeps their order.
	inserts
		.reverse()
		.sort( ( a, b ) => b[ 0 ] - a[ 0 ] )
		.forEach( ( [ at, block ] ) => result.splice( at, 0, block ) );
	return result;
}

/**
 * Merges the server's post into the user's without losing the user's typing. `base` is the
 * last post the page and the server agreed on.
 *
 * - Title: three-way. If both changed it, the user's title wins.
 * - Blocks, compared by their serialized markup:
 *   - If only one side changed the blocks, that side wins.
 *   - If the user only edited blocks in place (as many blocks as `base`), the result is the
 *     server's blocks with each block the user edited put where its base block is. When the
 *     server also changed or removed that block, the user's version is inserted after the
 *     previous block instead, next to the server's: both are kept.
 *   - If the user added or removed blocks and the server only edited blocks in place, the
 *     result is the user's blocks with each server edit put where its base block still is.
 *     A server edit to a block the user changed or removed is dropped.
 *   - If both added or removed blocks, the user's blocks win and the server's changes to the
 *     blocks are dropped. The page then sends its blocks back, so the server has them too.
 *
 * `sent` is a post the page sent that the server may have taken without the page knowing. A
 * server block from it is the user's own earlier version, so the user's newer edit replaces it
 * instead of being kept next to it: with as many blocks as `base`, only `sent`'s block at the
 * same index, if it changed; otherwise any `sent` block that isn't in `base`.
 */
export function mergePost(
	base: MergePost,
	local: MergePost,
	remote: MergePost,
	sent?: MergePost
): MergePost {
	const title = local.title === base.title ? remote.title : local.title;
	let blocks: string[];
	if ( sameBlocks( local.blocks, remote.blocks ) ) {
		blocks = local.blocks;
	} else if ( sameBlocks( local.blocks, base.blocks ) ) {
		blocks = remote.blocks;
	} else if ( sameBlocks( remote.blocks, base.blocks ) ) {
		blocks = local.blocks;
	} else if ( local.blocks.length === base.blocks.length ) {
		const ours = ( i: number ) => {
			if ( sent?.blocks.length === base.blocks.length ) {
				return sent.blocks[ i ] === base.blocks[ i ] ? [] : [ sent.blocks[ i ] ];
			}
			return sent?.blocks.filter( ( block ) => ! base.blocks.includes( block ) ) ?? [];
		};
		blocks = applyEdits( base.blocks, local.blocks, remote.blocks, true, ours );
	} else if ( remote.blocks.length === base.blocks.length ) {
		blocks = applyEdits( base.blocks, remote.blocks, local.blocks, false );
	} else {
		blocks = local.blocks;
	}
	return { title, blocks };
}
