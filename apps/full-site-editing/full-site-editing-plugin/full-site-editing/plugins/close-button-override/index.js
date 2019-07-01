/* global fullSiteEditing */

/**
 * External dependencies
 */
import domReady from '@wordpress/dom-ready';

domReady( () => {
	// We only want this override when closing Template Part CPT (e.g. header) to navigate back to parent page.
	if ( 'wp_template_part' !== fullSiteEditing.editorPostType ) {
		return;
	}

	// Keep the default URL if the override hasn't been provided by the plugin.
	if ( ! fullSiteEditing.closeButtonUrl ) {
		return;
	}

	const editPostHeaderInception = setInterval( () => {
		const closeButton = document.querySelector( '.edit-post-fullscreen-mode-close__toolbar a' );

		if ( ! closeButton ) {
			return;
		}
		clearInterval( editPostHeaderInception );

		if ( fullSiteEditing.closeButtonUrl ) {
			closeButton.href = fullSiteEditing.closeButtonUrl;
		}
	} );
} );
