import { createBlock } from '@wordpress/blocks';

interface BlockData {
	name: string;
	attributes?: Record< string, unknown >;
	innerBlocks?: BlockData[];
}

const cleanProcessingClasses = ( className: string ): string => {
	return className
		.split( ' ' )
		.filter(
			( cn ) =>
				! cn.startsWith( 'big-sky__is-processing' ) && ! cn.startsWith( 'big-sky__has-processed' )
		)
		.join( ' ' );
};

/**
 * Creates a WordPress block and its inner blocks recursively from plain
 * block-data objects, stripping processing CSS classes along the way.
 */
export const createBlockRecursively = async ( blockData: BlockData ): Promise< unknown > => {
	const processedInnerBlocks = blockData.innerBlocks?.length
		? await Promise.all( blockData.innerBlocks.map( createBlockRecursively ) )
		: [];

	const cleanedAttributes: Record< string, unknown > = {
		...( blockData.attributes || {} ),
	};
	if ( typeof cleanedAttributes.className === 'string' ) {
		cleanedAttributes.className = cleanProcessingClasses( cleanedAttributes.className );
	}

	return createBlock(
		blockData.name,
		cleanedAttributes,
		processedInnerBlocks as Parameters< typeof createBlock >[ 2 ]
	);
};
