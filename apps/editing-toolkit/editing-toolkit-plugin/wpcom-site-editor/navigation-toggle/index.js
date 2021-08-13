import domReady from '@wordpress/dom-ready';
import { render } from '@wordpress/element';
import CustomNavigationToggleButton from './custom-navigation-toggle-button';
import './style.scss';

function injectNavigationToggleButton() {
	if ( document.querySelector( '.wpcom-edit-site-navigation-toggle__button' ) ) {
		return;
	}
	const toggle = document.querySelector( '.edit-site-navigation-toggle' );
	if ( ! toggle ) {
		return;
	}
	render( <CustomNavigationToggleButton />, toggle );
}

/**
 * Renders a custom navigation sidebar toggle that will simply navigate back home on click.
 */
domReady( () => {
	if ( ! window.wp.editSite ) {
		return;
	}

	const waitForNavigationToggleButton = setInterval( () => {
		const toggleButton = document.querySelector( '.edit-site-navigation-toggle__button' );
		if ( ! toggleButton ) {
			return;
		}
		clearInterval( waitForNavigationToggleButton );

		injectNavigationToggleButton();

		// Re-inject the navigation toggle button as needed in case React re-renders the navigation sidebar
		const wpbody = document.getElementById( 'wpbody' );
		if ( wpbody && typeof window.MutationObserver !== 'undefined' ) {
			const observer = new window.MutationObserver( injectNavigationToggleButton );
			observer.observe( document.getElementById( 'wpbody' ), { subtree: true, childList: true } );
		}
	} );
} );
