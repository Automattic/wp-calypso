/* global fullSiteEditing */
/**
 * External dependencies
 */
import domReady from '@wordpress/dom-ready';

domReady( () => {
	if ( 'wp_template_part' !== fullSiteEditing.editorPostType ) {
		return;
	}
	const titleElement = document.querySelector( '#editor .editor-post-title' );
	if ( titleElement ) {
		titleElement.setAttribute( 'style', 'display: none;' );
	}
} );
