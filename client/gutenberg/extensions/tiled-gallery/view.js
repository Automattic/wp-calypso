/** @format */

/**
 * External dependencies
 */
import throttle from 'lodash/throttle';
import ResizeObserver from 'resize-observer-polyfill';

/**
 * Internal dependencies
 */
import { RESIZE_RATE_IN_MS, DEFAULT_GALLERY_WIDTH } from './constants';
import { getActiveStyleName, getLayout } from './layouts';

/**
 * Styles
 */
import './view.scss';

const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

// @TODO this isn't working; need a reliable canonical way to determine editor vs view?
const isEditor = isBrowser && window.hasOwnProperty( 'wp' ) && window.wp.hasOwnProperty( 'editor' );

const applyNodeSize = ( node, { width, height } ) => {
	node.style.width = `${ width }px`;
	node.style.height = `${ height }px`;
};

/**
 * Calculate new size for the gallery and apply it
 */
const resizeGallery = ( { galleryNode, width, columns, layout } ) => {
	const tileCount = galleryNode.querySelectorAll( '.tiled-gallery__item' ).length;

	const galleryLayout = getLayout( {
		columns,
		layout,
		tileCount,
		width,
	} );

	// eslint-disable-next-line
	// console.log('|', galleryLayout, options);

	// Resize rows within the gallery
	galleryNode.childNodes.forEach( ( rowNode, rowIndex ) => {
		const rowLayout = galleryLayout[ rowIndex ];
		// eslint-disable-next-line
		// console.log('| - row:', rowLayout, rowIndex );
		applyNodeSize( rowNode, rowLayout );

		// Resize tiles within the row
		const tileNodes = rowNode.querySelectorAll( '.tiled-gallery__item' );
		tileNodes.forEach( ( tileNode, tileIndex ) => {
			const tileLayout = rowLayout.tiles[ tileIndex ];
			// eslint-disable-next-line
			// console.log('|  ﹂ tile:', tileLayout, tileIndex );
			applyNodeSize( tileNode, tileLayout );
		} );
	} );
};

/**
 * Throttled resize event
 * Compares gallery width to its previous width to decide if to resize it.
 */
const throttleOnResize = throttle( entries => {
	for ( const entry of entries ) {
		const { width } = entry.contentRect;
		// Don't resize if width didn't chance
		if ( width !== entry.target.getAttribute( 'data-width' ) ) {
			// Store width for later comparison
			entry.target.setAttribute( 'data-width', width );
			resizeGallery( {
				columns: parseInt( entry.target.getAttribute( 'data-columns' ), 10 ),
				galleryNode: entry.target,
				layout: getActiveStyleName( entry.target.className ),
				width,
			} );
		}
	}
}, RESIZE_RATE_IN_MS );

/**
 * Get different galleries on the page
 *
 * @returns {NodeList} List of gallery nodes on the page
 */
const getGalleries = () => {
	return document ? document.querySelectorAll( '.wp-block-a8c-tiled-gallery' ) : [];
};

/**
 * Setup ResizeObserver to follow each gallery on the page
 */
const observeGalleries = () => {
	// Do nothing if page loads an editor
	if ( isEditor ) {
		return;
	}

	const galleries = getGalleries();

	if ( galleries.length === 0 ) {
		return;
	}

	const observer = new ResizeObserver( throttleOnResize );

	galleries.forEach( gallery => {
		// Observe only if gallery has child nodes
		if ( gallery.childNodes.length > 0 ) {
			// By default gallery has fixed width; element fluid fluid and move
			// width to `data-` to be able to compare changes in element's
			// current width to element's previous width.
			gallery.setAttribute(
				'data-width',
				parseInt( gallery.style.width, 10 ) || DEFAULT_GALLERY_WIDTH
			);
			gallery.style.width = 'auto';
			observer.observe( gallery );
		}
	} );
};

if ( isBrowser ) {
	// `DOMContentLoaded` may fire before the script has a chance to run
	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', observeGalleries );
	} else {
		observeGalleries();
	}
}
