/* global fullSiteEditing */

/**
 * External dependencies
 */
import domReady from '@wordpress/dom-ready';
import { render } from '@wordpress/element';

/**
 * Internal dependencies
 */
import PostContentBlockAppender from './post-content-block-appender';

/**
 * Renders a custom block inserter that will append new blocks inside the post content block.
 */
function renderPostContentBlockInserter() {
	if ( 'page' !== fullSiteEditing.editorPostType ) {
		return;
	}

	const editPostHeaderToolbarInception = setInterval( () => {
		const headerToolbar = document.querySelector( '.edit-post-header-toolbar' );

		if ( ! headerToolbar ) {
			return;
		}
		clearInterval( editPostHeaderToolbarInception );

		const blockInserterContainer = document.createElement( 'div' );
		blockInserterContainer.classList.add( 'fse-post-content-block-inserter' );

		headerToolbar.insertBefore( blockInserterContainer, headerToolbar.firstChild );

		render( <PostContentBlockAppender />, blockInserterContainer );
	} );
}

domReady( () => renderPostContentBlockInserter() );
