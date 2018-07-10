/**
 * External dependencies
 */
import { assign, difference, compact } from 'lodash';
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { createHigherOrderComponent, Fragment } from '@wordpress/element';
import { addFilter } from '@wordpress/hooks';
import { TextControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import {
	hasBlockSupport,
	parseWithAttributeSchema,
	getSaveContent,
} from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import { InspectorAdvancedControls } from '../components';

/**
 * Filters registered block settings, extending attributes with anchor using ID
 * of the first node.
 *
 * @param {Object} settings Original block settings.
 *
 * @return {Object} Filtered block settings.
 */
export function addAttribute( settings ) {
	if ( hasBlockSupport( settings, 'customClassName', true ) ) {
		// Use Lodash's assign to gracefully handle if attributes are undefined
		settings.attributes = assign( settings.attributes, {
			className: {
				type: 'string',
			},
		} );
	}

	return settings;
}

/**
 * Override the default edit UI to include a new block inspector control for
 * assigning the custom class name, if block supports custom class name.
 *
 * @param {function|Component} BlockEdit Original component.
 *
 * @return {string} Wrapped component.
 */
export const withInspectorControl = createHigherOrderComponent( ( BlockEdit ) => {
	return ( props ) => {
		const hasCustomClassName = hasBlockSupport( props.name, 'customClassName', true );

		if ( hasCustomClassName && props.isSelected ) {
			return (
				<Fragment>
					<BlockEdit { ...props } />
					<InspectorAdvancedControls>
						<TextControl
							label={ __( 'Additional CSS Class' ) }
							value={ props.attributes.className || '' }
							onChange={ ( nextValue ) => {
								props.setAttributes( {
									className: nextValue,
								} );
							} }
						/>
					</InspectorAdvancedControls>
				</Fragment>
			);
		}

		return <BlockEdit { ...props } />;
	};
}, 'withInspectorControl' );

/**
 * Override props assigned to save component to inject anchor ID, if block
 * supports anchor. This is only applied if the block's save result is an
 * element and not a markup string.
 *
 * @param {Object} extraProps Additional props applied to save element.
 * @param {Object} blockType  Block type.
 * @param {Object} attributes Current block attributes.
 *
 * @return {Object} Filtered props applied to save element.
 */
export function addSaveProps( extraProps, blockType, attributes ) {
	if ( hasBlockSupport( blockType, 'customClassName', true ) && attributes.className ) {
		extraProps.className = classnames( extraProps.className, attributes.className );
	}

	return extraProps;
}

/**
 * Given an HTML string, returns an array of class names assigned to the root
 * element in the markup.
 *
 * @param {string} innerHTML Markup string from which to extract classes.
 *
 * @return {string[]} Array of class names assigned to the root element.
 */
export function getHTMLRootElementClasses( innerHTML ) {
	innerHTML = `<div data-custom-class-name>${ innerHTML }</div>`;

	const parsed = parseWithAttributeSchema( innerHTML, {
		type: 'string',
		source: 'attribute',
		selector: '[data-custom-class-name] > *',
		attribute: 'class',
	} );

	return parsed ? parsed.trim().split( /\s+/ ) : [];
}

/**
 * Given a parsed set of block attributes, if the block supports custom class
 * names and an unknown class (per the block's serialization behavior) is
 * found, the unknown classes are treated as custom classes. This prevents the
 * block from being considered as invalid.
 *
 * @param {Object} blockAttributes Original block attributes.
 * @param {Object} blockType       Block type settings.
 * @param {string} innerHTML       Original block markup.
 *
 * @return {Object} Filtered block attributes.
 */
export function addParsedDifference( blockAttributes, blockType, innerHTML ) {
	if ( hasBlockSupport( blockType, 'customClassName', true ) ) {
		// To determine difference, serialize block given the known set of
		// attributes. If there are classes which are mismatched with the
		// incoming HTML of the block, add to filtered result.
		const serialized = getSaveContent( blockType, blockAttributes );
		const classes = getHTMLRootElementClasses( serialized );
		const parsedClasses = getHTMLRootElementClasses( innerHTML );
		const customClasses = difference( parsedClasses, classes );

		const filteredClassName = compact( [
			blockAttributes.className,
			...customClasses,
		] ).join( ' ' );

		if ( filteredClassName ) {
			blockAttributes.className = filteredClassName;
		} else {
			delete blockAttributes.className;
		}
	}

	return blockAttributes;
}

addFilter( 'blocks.registerBlockType', 'core/custom-class-name/attribute', addAttribute );
addFilter( 'editor.BlockEdit', 'core/editor/custom-class-name/with-inspector-control', withInspectorControl );
addFilter( 'blocks.getSaveContent.extraProps', 'core/custom-class-name/save-props', addSaveProps );
addFilter( 'blocks.getBlockAttributes', 'core/custom-class-name/addParsedDifference', addParsedDifference );
