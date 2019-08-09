/* global fullSiteEditing */

/**
 * External dependencies
 */
import domReady from '@wordpress/dom-ready';
import { select, subscribe } from '@wordpress/data';

domReady( () => {
	if ( 'wp_template' !== fullSiteEditing.editorPostType ) {
		return;
	}

	const { isEditorSidebarOpened, getActiveGeneralSidebarName } = select( 'core/edit-post' );

	subscribe( () => {
		if ( ! isEditorSidebarOpened() || 'edit-post/document' !== getActiveGeneralSidebarName() ) {
			return;
		}

		const moveToTrashButtonDisableInterval = setInterval( () => {
			const moveToTrash = document.querySelector( '.editor-post-trash' );
			if ( ! moveToTrash ) {
				return;
			}

			clearInterval( moveToTrashButtonDisableInterval );
			moveToTrash.parentElement.style.display = 'none';
		} );
	} );
} );
