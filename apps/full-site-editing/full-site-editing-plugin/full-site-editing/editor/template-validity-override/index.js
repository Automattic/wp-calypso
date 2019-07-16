/* global fullSiteEditing */

/**
 * External dependencies
 */
import domReady from '@wordpress/dom-ready';
import { dispatch } from '@wordpress/data';

/**
 * Forces the template validity.
 *
 * This is a work-around for the existing core issue that is showing a template mismatch warning when there is a parent
 * block with a locked template containing a nested InnerBlocks with an unlocked template.
 *
 * @see https://github.com/WordPress/gutenberg/issues/11681
 */
function resetTemplateValidity() {
	if ( 'page' !== fullSiteEditing.editorPostType ) {
		return;
	}

	dispatch( 'core/editor' ).setTemplateValidity( true );
}

domReady( () => resetTemplateValidity() );
