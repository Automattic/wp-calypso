/* global fullSiteEditing */

/**
 * External dependencies
 */
import { dispatch, subscribe } from '@wordpress/data';

/**
 * Disables specific sidebar editor panels in the FSE context.
 *
 * In particular, we remove the featured image panel for pages,
 * and we remove the post status panel for templates.
 *
 * Note that we only need to remove the panel once as it is persisted
 * in the redux state.
 */
const unsubscribe = subscribe( () => {
	const { removeEditorPanel } = dispatch( 'core/edit-post' );
	if ( 'page' === fullSiteEditing.editorPostType ) {
		removeEditorPanel( 'featured-image' );
	}

	// @TODO Since the post status component doesn't check to see if it is removed, the
	// removeEditorPanel action won't have the desired effect. See:
	// https://github.com/WordPress/gutenberg/pull/17117
	// When support is added, we should remove the CSS hack at '../style.scss'
	if ( 'wp_template_part' === fullSiteEditing.editorPostType ) {
		removeEditorPanel( 'post-status' );
	}
	return unsubscribe();
} );
