/** @format */

/**
 * External dependencies
 */
import { _x } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import { cloneElement, Children, Fragment } from '@wordpress/element';
import { registerBlockStyle } from '@wordpress/blocks';
import { createHigherOrderComponent } from '@wordpress/compose';

/**
 * Internal dependencies
 */
//import TiledGallery from './tiled-gallery';
import TiledGalleryInspectorControls from './inspector-controls';

const withInspectorControls = createHigherOrderComponent( BlockEdit => {
	return props => {
		if ( props.name !== 'core/gallery' ) {
			return <BlockEdit { ...props } />;
		}
		//eslint-disable-next-line
		// console.log( props );

		return (
			<Fragment>
				<BlockEdit { ...props } />
				{ props.isSelected &&
					props.attributes.images &&
					props.attributes.images.length && <TiledGalleryInspectorControls { ...props } /> }
			</Fragment>
		);
	};
}, 'withInspectorControl' );

// eslint-disable-next-line
const renderTiledGallery = ( element, block, props ) => {
	if ( block.name !== 'core/gallery' ) {
		return element;
	}

	const galleryItems = Children.map( element.props.children, child => {
		if ( child.props.className !== 'blocks-gallery-item' ) {
			return child;
		}

		const style = {
			// ...child.props.style,
			// Sizes just for a demo
			width: '200px',
			height: '200px',
		};

		const newClassName = 'blocks-gallery-item tiled-gallery-demo';

		const clone = cloneElement( child, { style, newClassName } );

		return clone;
	} );

	return <ul className={ element.props.className }>{ galleryItems }</ul>;
};

addFilter( 'editor.BlockEdit', 'a8c/tiled-gallery/edit', withInspectorControls );
addFilter( 'blocks.getSaveElement', 'a8c/tiled-gallery/save', renderTiledGallery );

registerBlockStyle( 'core/gallery', {
	name: 'a8c-gallery-tile',
	label: _x( 'Tiles', 'Gallery format' ),
} );
registerBlockStyle( 'core/gallery', {
	name: 'a8c-gallery-circle',
	label: _x( 'Circles', 'Gallery format' ),
} );
