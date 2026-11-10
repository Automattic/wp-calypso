/**
 * Mock for @wordpress/blocks package
 * The real package needs the unmocked @wordpress/data, so `parse` runs the block grammar only.
 */
import { parse as parseGrammar } from '@wordpress/block-serialization-default-parser';

interface Block {
	name: string | null;
	attributes: Record< string, unknown >;
	innerBlocks: Block[];
}

type RawBlock = ReturnType< typeof parseGrammar >[ number ];

function toBlock( rawBlock: RawBlock ): Block {
	return {
		name: rawBlock.blockName,
		attributes: rawBlock.attrs ?? {},
		innerBlocks: rawBlock.innerBlocks.map( toBlock ),
	};
}

export const parse = jest.fn( ( content: string ): Block[] =>
	parseGrammar( content ).map( toBlock )
);
