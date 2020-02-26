/**
 * External dependencies
 */
import { cloneBlock } from '@wordpress/blocks';

function modifyBlocks( blocks, cb ) {
	return blocks.map( block => {
		// `blocks` is an object. Therefore any changes made here will
		// be reflected across all references to the blocks object. To ensure we
		// only modify the blocks when needed, we return a new object reference
		// for any blocks we modify. This allows us to modify blocks for
		// particular contexts. For example we may wish to show blocks
		// differently in the preview than we do when they are inserted into the
		// editor itself.
		block = cb( cloneBlock( block ) );

		// Recurse into nested Blocks
		if ( block.innerBlocks && block.innerBlocks.length ) {
			block.innerBlocks = modifyBlocks( block.innerBlocks, cb );
		}

		return block;
	} );
}

export default modifyBlocks;
