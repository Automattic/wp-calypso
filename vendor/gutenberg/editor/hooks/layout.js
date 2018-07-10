/**
 * External dependencies
 */
import { assign, compact, get, without } from 'lodash';

/**
 * WordPress dependencies
 */
import { addFilter } from '@wordpress/hooks';

/**
 * Filters registered block settings, extending attributes with layout.
 *
 * @param {Object} settings Original block settings.
 *
 * @return {Object} Filtered block settings.
 */
export function addAttribute( settings ) {
	// Use Lodash's assign to gracefully handle if attributes are undefined
	settings.attributes = assign( settings.attributes, {
		layout: {
			type: 'string',
		},
	} );

	return settings;
}

/**
 * Override props assigned to save component to inject layout class. This is
 * only applied if the block's save result is an element and not a markup
 * string.
 *
 * @param {Object} extraProps Additional props applied to save element.
 * @param {Object} blockType  Block type.
 * @param {Object} attributes Current block attributes.
 *
 * @return {Object} Filtered props applied to save element.
 */
export function addSaveProps( extraProps, blockType, attributes ) {
	const { layout } = attributes;
	if ( layout ) {
		extraProps.className = compact( [
			extraProps.className,
			'layout-' + layout,
		] ).join( ' ' );
	}

	return extraProps;
}

/**
 * Given a transformed block, assigns the layout from the original block. Since
 * layout is a "global" attribute implemented via hooks, the individual block
 * transforms are not expected to handle this themselves, and a transform would
 * otherwise lose assigned layout.
 *
 * @param {Object} transformedBlock Original transformed block.
 * @param {Object} blocks           Blocks on which transform was applied.
 *
 * @return {Object} Modified transformed block, with layout preserved.
 */
function preserveLayoutAttribute( transformedBlock, blocks ) {
	// Since block transforms are many-to-many, use the layout attribute from
	// the first of the source blocks.
	const layout = get( blocks, [ 0, 'attributes', 'layout' ] );

	transformedBlock.attributes.layout = layout;

	return transformedBlock;
}

/**
 * Excludes the layout from the list of attributes to check
 * when determining if a block is unmodified or not.
 *
 * @param  {Object} attributeKeys  Attribute keys to check
 *
 * @return {Object}                Modified list of attribute keys
 */
function excludeLayoutFromUnmodifiedBlockCheck( attributeKeys ) {
	return without( attributeKeys, 'layout' );
}

addFilter( 'blocks.registerBlockType', 'core/layout/attribute', addAttribute );
addFilter( 'blocks.getSaveContent.extraProps', 'core/layout/save-props', addSaveProps );
addFilter( 'blocks.switchToBlockType.transformedBlock', 'core/layout/preserve-layout', preserveLayoutAttribute );
addFilter( 'blocks.isUnmodifiedDefaultBlock.attributes', 'core/layout/exclude-layout-attribute-check', excludeLayoutFromUnmodifiedBlockCheck );
