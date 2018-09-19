/** @format */

/* eslint-disable react/no-danger */

/**
 * External dependencies
 */
import { InnerBlocks } from '@wordpress/editor';
import { Fragment } from '@wordpress/element';
import tiledGalleryMath from './math';

const getStyles = ( { columns = 3, images = [], className } ) => {
	const rows = tiledGalleryMath( columns, images );
	//eslint-disable-next-line
	console.log( '🎨 ->getStyles', columns, images, className, rows );

	let styles = '';

	let nth = 0;
	rows.forEach( row => {
		styles += row.images
			.map( image => {
				// We could target also img's by ID:
				// return `${ wrapClass } img[data-id="${ image.id }"] {

				return `
				.${ className } .wp-block-gallery .blocks-gallery-item:nth-child(${ nth++ }) {
					width: ${ image.width }px !important;
					height: ${ image.height }px !important;
				}
			`;
			} )
			.join( '' );
	} );

	return styles;
};

export default ( { className, attributes } ) => {
	return (
		<Fragment>
			<div className={ className }>
				<style dangerouslySetInnerHTML={ { __html: getStyles( { ...attributes, className } ) } } />
				<InnerBlocks
					templateLock="all"
					template={ [ [ 'core/gallery', {} ] ] }
					allowedBlocks={ [ 'core/gallery' ] }
				/>
			</div>
		</Fragment>
	);
};
