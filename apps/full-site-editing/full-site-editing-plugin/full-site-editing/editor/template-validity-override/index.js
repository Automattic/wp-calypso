/* global fullSiteEditing */

/**
 * External dependencies
 */
import { select, dispatch, subscribe } from '@wordpress/data';

/**
 * Forces the template validity.
 *
 * This is a work-around for the existing core issue that is showing a template mismatch warning when there is a parent
 * block with a locked template containing a nested InnerBlocks with an unlocked template.
 *
 * @see https://github.com/WordPress/gutenberg/issues/11681
 */
const unsubscribe = subscribe( () => {
	if ( 'page' !== fullSiteEditing.editorPostType ) {
		return unsubscribe();
	}
	if ( select( 'core/block-editor' ).isValidTemplate() === false ) {
		dispatch( 'core/block-editor' ).setTemplateValidity( true );
	}
} );
