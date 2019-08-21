/* global fullSiteEditing */

/**
 * External dependencies
 */
import { dispatch, select, subscribe } from '@wordpress/data';

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
	const { getActiveGeneralSidebarName } = select( 'core/edit-post' );
	const { removeEditorPanel } = dispatch( 'core/edit-post' );

	if ( 'page' === fullSiteEditing.editorPostType ) {
		removeEditorPanel( 'featured-image' );
		return unsubscribe();
	}

	if ( 'wp_template' === fullSiteEditing.editorPostType ) {
		// @TODO Since the post status component doesn't check to see if it is removed, the
		// removeEditorPanel action won't have the desired effect. See:
		// https://github.com/WordPress/gutenberg/pull/17117
		// When support is added, we should add this line back in and remove the DOM manipulation hack:
		// removeEditorPanel( 'post-status' );

		// Only run the hack when the document sidebar is opened:
		if ( 'edit-post/document' === getActiveGeneralSidebarName() ) {
			const impendingElement = setInterval( () => {
				const postStatusElement = document.querySelector(
					'.components-panel__body.edit-post-post-status'
				);
				postStatusElement && postStatusElement.classList.add( 'hidden' );
				clearInterval( impendingElement );
				// We cannot unsubscribe since the element can be recreated by React.
			} );
		}
	}
} );
