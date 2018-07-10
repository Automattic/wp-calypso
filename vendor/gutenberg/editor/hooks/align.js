/**
 * External dependencies
 */
import classnames from 'classnames';
import { assign, includes } from 'lodash';

/**
 * WordPress dependencies
 */
import { createHigherOrderComponent } from '@wordpress/element';
import { addFilter } from '@wordpress/hooks';
import { hasBlockSupport, getBlockSupport } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import { BlockControls, BlockAlignmentToolbar } from '../components';

/**
 * Filters registered block settings, extending attributes to include `align`.
 *
 * @param  {Object} settings Original block settings
 * @return {Object}          Filtered block settings
 */
export function addAttribute( settings ) {
	if ( hasBlockSupport( settings, 'align' ) ) {
		// Use Lodash's assign to gracefully handle if attributes are undefined
		settings.attributes = assign( settings.attributes, {
			align: {
				type: 'string',
			},
		} );
	}

	return settings;
}

/**
 * Returns an array of valid alignments for a block type depending on its
 * defined supports. Returns an empty array if block does not support align.
 *
 * @param  {string}   blockName Block name to check
 * @return {string[]}           Valid alignments for block
 */
export function getBlockValidAlignments( blockName ) {
	// Explicitly defined array set of valid alignments
	const blockAlign = getBlockSupport( blockName, 'align' );
	if ( Array.isArray( blockAlign ) ) {
		return blockAlign;
	}

	const validAlignments = [];
	if ( true === blockAlign ) {
		// `true` includes all alignments...
		validAlignments.push( 'left', 'center', 'right' );

		// ...including wide alignments unless explicitly `false`.
		if ( hasBlockSupport( blockName, 'wideAlign', true ) ) {
			validAlignments.push( 'wide', 'full' );
		}
	}

	return validAlignments;
}

/**
 * Override the default edit UI to include new toolbar controls for block
 * alignment, if block defines support.
 *
 * @param  {Function} BlockEdit Original component
 * @return {Function}           Wrapped component
 */
export const withToolbarControls = createHigherOrderComponent( ( BlockEdit ) => {
	return ( props ) => {
		const validAlignments = getBlockValidAlignments( props.name );

		const updateAlignment = ( nextAlign ) => props.setAttributes( { align: nextAlign } );

		return [
			validAlignments.length > 0 && props.isSelected && (
				<BlockControls key="align-controls">
					<BlockAlignmentToolbar
						value={ props.attributes.align }
						onChange={ updateAlignment }
						controls={ validAlignments }
					/>
				</BlockControls>
			),
			<BlockEdit key="edit" { ...props } />,
		];
	};
}, 'withToolbarControls' );

/**
 * Override the default block element to add alignment wrapper props.
 *
 * @param  {Function} BlockListBlock Original component
 * @return {Function}                Wrapped component
 */
export const withDataAlign = createHigherOrderComponent( ( BlockListBlock ) => {
	return ( props ) => {
		const { align } = props.block.attributes;
		const validAlignments = getBlockValidAlignments( props.block.name );

		let wrapperProps = props.wrapperProps;
		if ( includes( validAlignments, align ) ) {
			wrapperProps = { ...wrapperProps, 'data-align': align };
		}

		return <BlockListBlock { ...props } wrapperProps={ wrapperProps } />;
	};
}, 'withDataAlign' );

/**
 * Override props assigned to save component to inject alignment class name if
 * block supports it.
 *
 * @param  {Object} props      Additional props applied to save element
 * @param  {Object} blockType  Block type
 * @param  {Object} attributes Block attributes
 * @return {Object}            Filtered props applied to save element
 */
export function addAssignedAlign( props, blockType, attributes ) {
	const { align } = attributes;

	if ( includes( getBlockValidAlignments( blockType ), align ) ) {
		props.className = classnames( `align${ align }`, props.className );
	}

	return props;
}

addFilter( 'blocks.registerBlockType', 'core/align/addAttribute', addAttribute );
addFilter( 'editor.BlockListBlock', 'core/editor/align/with-data-align', withDataAlign );
addFilter( 'editor.BlockEdit', 'core/editor/align/with-toolbar-controls', withToolbarControls );
addFilter( 'blocks.getSaveContent.extraProps', 'core/align/addAssignedAlign', addAssignedAlign );

