/* global fullSiteEditing */

/**
 * External dependencies
 */
import domReady from '@wordpress/dom-ready';
import { __ } from '@wordpress/i18n';

domReady( () => {
	const { closeButtonLabel, closeButtonUrl, editorPostType } = fullSiteEditing;

	const editPostHeaderInception = setInterval(
		() => {
			const closeButton = document.querySelector( '.edit-post-fullscreen-mode-close__toolbar a' );

			if ( ! closeButton ) {
				// no close Button in window mode, lets create one
				const toolbar = document.querySelector( '.edit-post-header-toolbar' );
				const buttonWrapper = document.createElement( 'a' );
				buttonWrapper.className = 'edit-post-fullscreen-mode-close__toolbar';
				const placeholderButton = document.createElement( 'a' );
				buttonWrapper.prepend( placeholderButton );
				toolbar.prepend( buttonWrapper );
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

				const parentContainer = document.querySelector(
					'.edit-post-fullscreen-mode-close__toolbar'
				);
				parentContainer.replaceChild( newCloseButton, closeButton );
			} else if ( 'page' === editorPostType && window.location.toString().includes( 'wp-admin' ) ) {
				const newCloseButton = document.createElement( 'a' );
				newCloseButton.href = 'edit.php?post_type=page'; // wrong href if not using wp-admin
				newCloseButton.innerHTML = __( 'Back to Page List' );
				newCloseButton.className = 'components-button components-icon-button is-button is-default';
				newCloseButton.setAttribute( 'aria-label', closeButtonLabel );

				const parentContainer = document.querySelector(
					'.edit-post-fullscreen-mode-close__toolbar'
				);
				parentContainer.replaceChild( newCloseButton, closeButton );
			}
		},
		// set short delay to ensure back button added after + add block button
		50
	);
} );
