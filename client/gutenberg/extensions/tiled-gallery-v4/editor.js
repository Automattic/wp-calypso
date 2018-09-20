/** @format */

/**
 * External dependencies
 */
//import { _x } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import { Fragment } from '@wordpress/element';
//import { cloneElement, Children, Fragment } from '@wordpress/element';
//import { registerBlockStyle } from '@wordpress/blocks';
import { createHigherOrderComponent } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import tiledGalleryMath from './math';
import TiledGalleryInspectorControls from './inspector-controls';

const getStyles = ( { columns = 3, images = [] } ) => {
	const rows = tiledGalleryMath( columns, images );
	//eslint-disable-next-line
	console.log( '🎨 ->getStyles', rows );

	const wrapClass = '.wp-block-gallery .blocks-gallery-item:not( .has-add-item-button )';

	let styles = `${ wrapClass } {
		margin: 2px;
		width: auto !important;
		height: auto !important;
		/* border: 1px solid blue; */
	}`;

	rows.forEach( row => {
		const rowStyle = row.images.map( image => {
			//eslint-disable-next-line
			// console.log( image );
			return `${ wrapClass } img[data-id="${ image.id }"] {
				width: ${ image.width }px !important;
				height: ${ image.height }px !important;
				/* border: 1px solid red; */
			}`;
		} );
		styles += rowStyle.join( '' );
	} );

	//eslint-disable-next-line
	// console.log(styles);

	return { __html: styles };
};

const withInspectorControls = createHigherOrderComponent( BlockEdit => {
	return props => {
		if ( props.name !== 'core/gallery' ) {
			return <BlockEdit { ...props } />;
		}
		//eslint-disable-next-line
		console.log( '💥 ->edit', props.attributes );

		/* eslint-disable react/no-danger */
		return (
			<Fragment>
				<style dangerouslySetInnerHTML={ getStyles( props.attributes ) } />
				<BlockEdit { ...props } />
				{ props.isSelected &&
					props.attributes.images &&
					props.attributes.images.length && <TiledGalleryInspectorControls { ...props } /> }
			</Fragment>
		);
		/* eslint-enable react/no-danger */
	};
}, 'withInspectorControl' );

// eslint-disable-next-line
const renderTiledGallery = ( element, block, props ) => {
	if ( block.name !== 'core/gallery' ) {
		return element;
	}

	// eslint-disable-next-line
	console.log( '🚀 ->render', element, block, props );

	/* eslint-disable react/no-danger */
	return (
		<Fragment>
			<style dangerouslySetInnerHTML={ getStyles( props ) } />
			{ element }
		</Fragment>
	);
	/* eslint-enable react/no-danger */
};

addFilter( 'editor.BlockEdit', 'a8c/tiled-gallery/edit', withInspectorControls );
addFilter( 'blocks.getSaveElement', 'a8c/tiled-gallery/save', renderTiledGallery );
