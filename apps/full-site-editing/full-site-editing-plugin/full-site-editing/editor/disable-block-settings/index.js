/* global fullSiteEditing */

/**
 * External dependencies
 */
import { select, dispatch, subscribe } from '@wordpress/data';
import { get } from 'lodash';

/**
 * Removes the block settings panel if the template or post content blocks are selected.
 * Since it is not possible to disable the block settings entirely through Gutenberg state,
 * we use a hack to deselect the block, which removes the option to change its settings.
 * This is also done officially in the core PostTitle block, so there is prior art.
 *
 * @see https://github.com/WordPress/gutenberg/blob/master/packages/editor/src/components/post-title/index.js
 */
const unsubscribe = subscribe( () => {
	// We don't care about this on the template or post editor
	if ( 'page' !== fullSiteEditing.editorPostType ) {
		return unsubscribe();
	}

	// Determine which block we have selected:
	const selectedBlock = select( 'core/editor' ).getSelectedBlock();
	const blockName = get( selectedBlock, 'name', null );

	// If we have selected a template block, deselect it.
	// Note: this does not work for post content because you can't
	// edit inner blocks if the outer block is deselected.
	if ( 'a8c/template' === blockName ) {
		dispatch( 'core/block-editor' ).clearSelectedBlock( blockName );
	}
} );
