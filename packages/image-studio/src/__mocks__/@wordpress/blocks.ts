/**
 * Mock for @wordpress/blocks package
 * The real package needs the unmocked @wordpress/data, so `parse` runs the block grammar only.
 */
import { parse as parseGrammar } from '@wordpress/block-serialization-default-parser';
import { vi } from 'vitest';

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

export const parse = vi.fn( ( content: string ): Block[] =>
	parseGrammar( content ).map( toBlock )
);
