import domReady from '@wordpress/dom-ready';
import { render } from '@wordpress/element';
import CustomNavigationToggleButton from './custom-navigation-toggle-button';
import './style.scss';

const CUSTOM_NAVIGATION_TOGGLE_CLASS_NAME = '.wpcom-edit-site-navigation-toggle__button';
const NAVIGATION_TOGGLE_CLASS_NAME = '.edit-site-navigation-toggle';
const NAVIGATION_TOGGLE_BUTTON_CLASS_NAME = '.edit-site-navigation-toggle__button';

function injectNavigationToggleButton() {
	if ( document.querySelector( CUSTOM_NAVIGATION_TOGGLE_CLASS_NAME ) ) {
		return;
	}
	const toggle = document.querySelector( NAVIGATION_TOGGLE_CLASS_NAME );
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
		const toggleButton = document.querySelector( NAVIGATION_TOGGLE_BUTTON_CLASS_NAME );
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
