/* global fullSiteEditing */

/**
 * External dependencies
 */
import domReady from '@wordpress/dom-ready';
import { render } from '@wordpress/element';
import { Inserter } from '@wordpress/editor';
import { compose } from '@wordpress/compose';
import { withSelect } from '@wordpress/data';

const PostContentBlockAppender = compose(
	withSelect( select => {
		const { getBlocks, getEditorSettings } = select( 'core/editor' );
		const { getEditorMode } = select( 'core/edit-post' );

		const postContentBlock = getBlocks().find( block => block.name === 'a8c/post-content' );

		return {
			rootClientId: postContentBlock ? postContentBlock.clientId : '',
			showInserter: getEditorMode() === 'visual' && getEditorSettings().richEditingEnabled,
		};
	} )
)( ( { rootClientId, showInserter } ) => {
	return (
		<Inserter rootClientId={ rootClientId } disabled={ ! showInserter } position="bottom right" />
	);
} );

/**
 * Renders a custom block inserter that will append new blocks inside the post content block.
 */
function renderPostContentBlockInserter() {
	if ( 'page' !== fullSiteEditing.editorPostType ) {
		return;
	}

	const headerToolbar = document.querySelector( '.edit-post-header-toolbar' );
	const blockInserterContainer = document.createElement( 'div' );
	blockInserterContainer.classList.add( 'fse-post-content-block-inserter' );

	headerToolbar.insertBefore( blockInserterContainer, headerToolbar.firstChild );

	render( <PostContentBlockAppender />, blockInserterContainer );
}

domReady( () => renderPostContentBlockInserter() );
