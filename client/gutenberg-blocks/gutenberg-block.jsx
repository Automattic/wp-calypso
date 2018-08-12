/** @format */

/**
 * External dependencies
 */
import { getBlockType, getSaveElement, getBlockDefaultClassName } from '@wordpress/blocks';
import { addFilter } from '@wordpress/hooks';

const GutenbergBlock = ( { name, attributes } ) => {
	addFilter(
		'blocks.getSaveContent.extraProps',
		'devdocs/gutenberg-block/render',
		getBlockDefaultClassName
	);

	return getSaveElement( getBlockType( name ), attributes );
};

export default GutenbergBlock;
