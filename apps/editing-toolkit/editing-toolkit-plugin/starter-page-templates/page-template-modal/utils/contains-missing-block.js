// Once parsed, missing Blocks have a name prop of `core/missing`.
// see: https://github.com/WordPress/gutenberg/tree/742dbf2ef0e37481a3c14c29f3688aa0cd3cf887/packages/block-library/src/missing
const MISSING_BLOCK_NAME = 'core/missing';

/**
 * Determines whether the provided collection of Blocks contains any "missing"
 * blocks as determined by the presence of the `core/missing` block type.
 *
 * @param {Array} blocks the collection of block objects to check for "missing" block .
 * @returns {boolean} whether the collection blocks contains any missing blocks.
 */
function containsMissingBlock( blocks ) {
	return !! blocks.find( ( block ) => {
		// If we found a missing block the bale out immediately
		if ( block.name === MISSING_BLOCK_NAME ) {
			return true;
		}

		// If there are innerblocks then recurse down into them...
		if ( block.innerBlocks && block.innerBlocks.length ) {
			return containsMissingBlock( block.innerBlocks );
		}

		return false;
	} );
}

export default containsMissingBlock;
