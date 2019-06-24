/**
 * External dependencies
 */
import { select, subscribe } from '@wordpress/data';

/**
 * Style dependencies
 */
import './style.scss';

const replaceSiteTitle = () => {
	subscribe( () => {
		const isFullPage = select( 'a8c/full-site-editing' ).isFullPage();

		document.querySelector( '#editor' ).classList.toggle( 'hide-post-title', isFullPage );
	} );
};

replaceSiteTitle();
