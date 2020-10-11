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

const CONTAINER_CLASS_NAME = 'fse-post-content-block-inserter';
const CONTAINER_ID = 'fse-post-content-block-inserter';

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
		injectBlockInserter();

		// Re-inject the FSE inserter as needed in case React re-renders the header
		const wpbody = document.getElementById( 'wpbody' );
		if ( wpbody && typeof window.MutationObserver !== 'undefined' ) {
			const observer = new window.MutationObserver( injectBlockInserter );
			observer.observe( document.getElementById( 'wpbody' ), { subtree: true, childList: true } );
		}
	} );
}

function injectBlockInserter() {
	if ( document.getElementById( CONTAINER_ID ) ) {
		return;
	}

	const headerToolbar = document.querySelector( '.edit-post-header-toolbar' );
	if ( ! headerToolbar ) {
		return;
	}

	const blockInserterContainer = document.createElement( 'div' );
	blockInserterContainer.className = CONTAINER_CLASS_NAME;
	blockInserterContainer.id = CONTAINER_ID;

	headerToolbar.insertBefore( blockInserterContainer, headerToolbar.firstChild );

	render( <PostContentBlockAppender />, blockInserterContainer );
}

domReady( renderPostContentBlockInserter );
