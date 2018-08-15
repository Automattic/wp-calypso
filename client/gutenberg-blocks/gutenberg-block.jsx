/** @format */

/**
 * External dependencies
 */
import { createBlock, getBlockType, getSaveElement } from '@wordpress/blocks';

const createBlockWithInnerBlocks = ( name, attributes, children ) => {
	const innerBlocks = children
		? children.map( innerBlock => {
				return createBlockWithInnerBlocks(
					innerBlock.props.name,
					innerBlock.props.attributes,
					innerBlock.props.children
				);
		  } )
		: [];
	return createBlock( name, attributes, innerBlocks );
};

const GutenbergBlock = ( { name, attributes, children } ) => {
	const block = createBlockWithInnerBlocks( name, attributes, children );
	return getSaveElement( getBlockType( block.name ), block.attributes, block.innerBlocks );
};

export default GutenbergBlock;
