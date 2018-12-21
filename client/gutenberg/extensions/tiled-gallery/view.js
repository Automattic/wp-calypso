/**
 * Internal dependencies
 */
import './view.scss';
import ResizeObserver from 'resize-observer-polyfill';
import { handleRowResize } from './resize';

/**
 *
 * @param {Array<ResizeObserverEntry>} galleries Resized galleries
 */
function handleObservedResize( galleries ) {
	if ( handleObservedResize.pendingRaf ) {
		cancelAnimationFrame( handleObservedResize.pendingRaf );
	}
	handleObservedResize.pendingRaf = requestAnimationFrame( () => {
		handleObservedResize.pendingRaf = null;
		for ( const gallery of galleries ) {
			const { width: galleryWidth } = gallery.contentRect;
			const rows = Array.from( gallery.target.childNodes );
			rows.forEach( row => handleRowResize( row, galleryWidth ) );
		}
	} );
}

/**
 * Get all the galleries on the document
 *
 * @returns {Array} List of gallery nodes
 */
function getGalleries() {
	return Array.from(
		document.querySelectorAll( '.wp-block-jetpack-tiled-gallery.is-style-rectangular' )
	);
}

/**
 * Setup ResizeObserver to follow each gallery on the page
 */
const observeGalleries = () => {
	const galleries = getGalleries();

	if ( galleries.length === 0 ) {
		return;
	}

	const observer = new ResizeObserver( handleObservedResize );

	galleries.forEach( gallery => void observer.observe( gallery ) );
};

if ( typeof window !== 'undefined' && typeof document !== 'undefined' ) {
	// `DOMContentLoaded` may fire before the script has a chance to run
	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', observeGalleries );
	} else {
		observeGalleries();
	}
}
