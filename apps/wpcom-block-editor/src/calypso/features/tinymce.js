/* eslint-disable import/no-extraneous-dependencies */

/**
 * External dependencies
 */
import tinymce from 'tinymce/tinymce';

/**
 * Internal dependencies
 */
import { inIframe, sendMessage } from '../../utils';

function replaceMediaModalOnClassicBlocks() {
	if ( ! inIframe() ) {
		return;
	}

	tinymce.PluginManager.add( 'gutenberg-wpcom-iframe-media-modal', ( editor ) => {
		editor.addCommand( 'WP_Medialib', () => {
			sendMessage( {
				action: 'classicBlockOpenMediaModal',
				editorId: editor.id,
			} );
		} );

		editor.buttons.wp_img_edit.onclick = () => {
			const img = editor.selection.getNode();
			const imageId = img.className.match( /wp-image-(\d+)/ )[ 1 ];
			sendMessage( {
				action: 'classicBlockOpenMediaModal',
				editorId: editor.id,
				imageId: imageId,
			} );
		};
	} );
}

replaceMediaModalOnClassicBlocks();
