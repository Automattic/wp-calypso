/* global fullSiteEditing */

/**
 * External dependencies
 */
import domReady from '@wordpress/dom-ready';

/**
 * Removes switch to draft button on templates.
 *
 * It doesn't make sense to have this shown on templates since we always want to preserve templates
 * as published. Drafting or trashing them could break FSE functionality.
 */
function removeSwitchToDraftButton() {
	// Only remove Switch to Draft button on template post type.
	if ( 'wp_template' !== fullSiteEditing.editorPostType ) {
		return;
	}

	const switchToDraftRemoveInterval = setInterval( () => {
		const draftButton = document.querySelector( '.editor-post-switch-to-draft' );

		if ( ! draftButton ) {
			return;
		}

		clearInterval( switchToDraftRemoveInterval );

		draftButton.parentNode.removeChild( draftButton );
	} );
}

domReady( () => removeSwitchToDraftButton() );
