import { BlockInstance, cloneBlock } from '@wordpress/blocks';

type Writeable< T > = { -readonly [ P in keyof T ]: T[ P ] };

/**
 * Recursively maps over a collection of blocks calling the modifier function on
 * each to modify it and returning a collection of new block references.
 * @param blocks an array of block objects
 * @param modifier a callback function used to modify the blocks
 */
function mapBlocksRecursively(
	blocks: Writeable< BlockInstance >[],
	modifier: ( block: BlockInstance ) => BlockInstance
): BlockInstance[] {
	return blocks.map( ( block ) => {
		// `blocks` is an object. Therefore any changes made here will
		// be reflected across all references to the blocks object. To ensure we
		// only modify the blocks when needed, we return a new object reference
		// for any blocks we modify. This allows us to modify blocks for
		// particular contexts. For example we may wish to show blocks
		// differently in the preview than we do when they are inserted into the
		// editor itself.
		block = modifier( cloneBlock( block ) );

		// Recurse into nested Blocks
		if ( block.innerBlocks && block.innerBlocks.length ) {
			block.innerBlocks = mapBlocksRecursively( block.innerBlocks, modifier );
		}

		return block;
	} );
}

export default mapBlocksRecursively;
