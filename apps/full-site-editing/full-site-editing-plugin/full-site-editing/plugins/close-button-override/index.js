/* global fullSiteEditing */

/**
 * External dependencies
 */
import domReady from '@wordpress/dom-ready';

domReady( () => {
	const { closeButtonLabel, closeButtonUrl, editorPostType } = fullSiteEditing;

	const editPostHeaderInception = setInterval( () => {
		const closeButton = document.querySelector( '.edit-post-fullscreen-mode-close__toolbar a' );

		if ( ! closeButton ) {
			return;
		}
		clearInterval( editPostHeaderInception );

		// When closing Template CPT (e.g. header) to navigate back to parent page.
		if ( 'wp_template_part' === editorPostType && closeButtonUrl ) {
			const newCloseButton = document.createElement( 'a' );
			newCloseButton.href = closeButtonUrl;
			newCloseButton.innerHTML = closeButtonLabel;
			newCloseButton.className = 'components-button components-icon-button is-button is-default';
			newCloseButton.setAttribute( 'aria-label', closeButtonLabel );

			const parentContainer = document.querySelector( '.edit-post-fullscreen-mode-close__toolbar' );
			parentContainer.replaceChild( newCloseButton, closeButton );
		}
	} );
} );
