import { parse } from '@wordpress/blocks';

export const getBlocksUsage = ( content: string ) => {
	const parsedContent = parse( content ) || [];

	return parsedContent.reduce(
		( acc, block ) => {
			const [ , blockType ] = block.name.split( '/' );
			acc[ `${ blockType }_count` ] = ( acc[ `${ blockType }_count` ] || 0 ) + 1;
			return acc;
		},
		{} as Record< string, number >
	);
};
