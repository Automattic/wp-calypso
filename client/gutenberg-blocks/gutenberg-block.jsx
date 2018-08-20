/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { createBlock, serialize } from '@wordpress/blocks';
import { RawHTML } from '@wordpress/element';

const createBlockWithInnerBlocks = ( name, attributes, children ) => {
	const innerBlocks = children
		? React.Children.map( children, innerBlock =>
				createBlockWithInnerBlocks(
					innerBlock.props.name,
					innerBlock.props.attributes,
					innerBlock.props.children
				)
		  )
		: [];
	return createBlock( name, attributes, innerBlocks );
};

const GutenbergBlock = ( { name, attributes, children } ) => {
	const block = createBlockWithInnerBlocks( name, attributes, children );
	return <RawHTML>{ serialize( block ) }</RawHTML>;
};

export default GutenbergBlock;
