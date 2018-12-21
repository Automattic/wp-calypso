/**
 * Internal dependencies
 */
import './view.scss';
import ResizeObserver from 'resize-observer-polyfill';
import { handleResize } from './resize';

document.addEventListener( 'DOMContentLoaded', () => {
	const rows = document.querySelectorAll(
		'.wp-block-jetpack-tiled-gallery.is-style-rectangular .tiled-gallery__row'
	);

	window.addEventListener( 'load', () => {
		for ( const row of rows ) {
			handleResize( row );
		}
	} );
} );
