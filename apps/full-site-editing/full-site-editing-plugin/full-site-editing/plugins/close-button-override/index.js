/* global fullSiteEditing */

/**
 * External dependencies
 */
import domReady from '@wordpress/dom-ready';

/**
 * Internal dependencies
 */
import './style.scss';

domReady( () => {
	const { closeButtonLabel, closeButtonUrl, editorPostType } = fullSiteEditing;

	const editPostHeaderInception = setInterval( () => {
		const closeButton = document.querySelector( '.edit-post-fullscreen-mode-close__toolbar a' );

		if ( ! closeButton ) {
			return;
		}
		clearInterval( editPostHeaderInception );

		// When closing Template CPT (e.g. header) to navigate back to parent page.
		if ( 'wp_template' === editorPostType && closeButtonUrl ) {
			const newCloseButton = document.createElement( 'a' );
			newCloseButton.href = closeButtonUrl;
			newCloseButton.innerHTML = closeButtonLabel;
			newCloseButton.className = 'components-button components-icon-button is-button is-default';
			newCloseButton.setAttribute( 'aria-label', closeButtonLabel );

			const parentContainer = document.querySelector( '.edit-post-fullscreen-mode-close__toolbar' );
			parentContainer.replaceChild( newCloseButton, closeButton );
		} else {
			// Otherwise just replace the left caret with an X icon.
			// The size is 28 instead of 20 because `dashicons-no-alt` looks smaller than `dashicons-arrow-left-alt2`.
			closeButton.innerHTML =
				'<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="28" height="28" viewBox="0 0 20 20"><path d="M14.95 6.46l-3.54 3.54 3.54 3.54-1.41 1.41-3.54-3.53-3.53 3.53-1.42-1.42 3.53-3.53-3.53-3.53 1.42-1.42 3.53 3.53 3.54-3.53z"></path></svg>';
			closeButton.classList.add( 'a8c-close-button' );
		}
	} );
} );
