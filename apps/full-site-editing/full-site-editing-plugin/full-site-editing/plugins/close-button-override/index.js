/* global fullSiteEditing */

/**
 * External dependencies
 */
import domReady from '@wordpress/dom-ready';

domReady( () => {
	const { closeButtonLabel, closeButtonUrl, editorPostType } = fullSiteEditing;

	const editPostHeaderInception = setInterval( () => {
		const closeButton = document.querySelector( '.edit-post-fullscreen-mode-close__toolbar a' );

		// console.log( closeButton );
		// console.log( editorPostType + ' ' + closeButtonUrl );
		// console.log(closeButtonUrl)

		if ( ! closeButton ) {
			// no close Button in window mode, lets create one
			const toolbar = document.querySelector( '.edit-post-header-toolbar' );
			// console.log( toolbar );
			const closeButtonWrapper = document.createElement( 'a' );
			closeButtonWrapper.className = 'edit-post-fullscreen-mode-close__toolbar';
			const placeholderButton = document.createElement( 'a' );
			closeButtonWrapper.prepend( placeholderButton );
			toolbar.prepend( closeButtonWrapper );
			return;
		}
		clearInterval( editPostHeaderInception );

		//

		// When closing Template CPT (e.g. header) to navigate back to parent page.
		if ( 'wp_template_part' === editorPostType && closeButtonUrl ) {
			const newCloseButton = document.createElement( 'a' );
			newCloseButton.href = closeButtonUrl;
			newCloseButton.innerHTML = closeButtonLabel;
			newCloseButton.className = 'components-button components-icon-button is-button is-default';
			newCloseButton.setAttribute( 'aria-label', closeButtonLabel );

			const parentContainer = document.querySelector( '.edit-post-fullscreen-mode-close__toolbar' );
			parentContainer.replaceChild( newCloseButton, closeButton );
		} else if ( 'page' === editorPostType ) {
			// console.log( 'its a page' );
		}
	}, 1000 );
} );
