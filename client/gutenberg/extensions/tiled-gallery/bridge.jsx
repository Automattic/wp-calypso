
/**
 * External dependencies
 */
import { createHigherOrderComponent } from '@wordpress/compose';
import { dispatch, select } from '@wordpress/data';
import get from 'lodash/get';

/**
 * Internal dependencies
 */
import { blockType } from './editor';

/**
 * BlockListBlock: https://github.com/WordPress/gutenberg/blob/45bc8e4991d408bca8e87cba868e0872f742230b/packages/editor/src/components/block-list/block.js
 */
const bridge = createHigherOrderComponent( BlockListBlock => {

	const { selectBlock, updateBlockAttributes } = dispatch( 'core/editor' );

	return ( props ) => {

		/**
		 * Tiled gallery block
		 */
		if ( props.block.name === blockType ) {
			//eslint-disable-next-line
			console.log( '👩 parent:', props );

			const innerBlockClientId = get( props, 'block.innerBlocks[0].clientId', false );

			if ( ! innerBlockClientId ) {
				return <BlockListBlock { ...props } />;
			}

			// Bridge selecting block to inner block
			// i.e. Inner block will be selected when attempting to select parent
			const wrapperProps = {
				...props,
				onSelect( clientId, initialPosition ) {
					selectBlock( innerBlockClientId, initialPosition );
				},
			};

			return <BlockListBlock { ...wrapperProps } />;
		}

		/**
		 * Core-gallery block when it's inside Tiled-Gallery
		 */
		if ( props.block.name === 'core/gallery' && props.rootClientId ) {
			//eslint-disable-next-line
			console.log( '👶 inner block:', props, props.blockRef() );

			// Get info about parent block
			const rootBlock = select( 'core/editor' ).getBlock( props.rootClientId );

			//eslint-disable-next-line
			console.log( '👩‍👦 inner block\'s parent:', rootBlock );

			// Core-Gallery isn't inside tiled-gallery, it's inside some other block
			if ( rootBlock.name !== blockType) {
				return <BlockListBlock { ...props } />;
			}

			// Bridge attribute updates to parent block
			const wrapperProps = {
				...props,
				onChange( clientId, attributes ) {
					updateBlockAttributes( clientId, attributes );
					updateBlockAttributes( props.rootClientId, { ...rootBlock.attributes, ...attributes } );
				},
			};

			return <BlockListBlock { ...wrapperProps } />;
		}

		// Every other block
		return <BlockListBlock { ...props } />;
	};
}, 'TiledGalleryBridge' );

export default bridge;
