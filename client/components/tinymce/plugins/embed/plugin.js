/**
 * External dependencies
 */

import React from 'react';
import ReactDom from 'react-dom';
import tinymce from 'tinymce/tinymce';

/**
 * Internal dependencies
 */
import EmbedDialog from './dialog';
import { renderWithReduxStore } from 'lib/react-helpers';

/**
 * Manages an EmbedDialog to allow editing the URL of an embed inside the editor.
 *
 * @param {object} editor An instance of TinyMCE
 */
function embed( editor ) {
	let embedDialogContainer;

	/**
	 * Open or close the EmbedDialog
	 *
	 * @param {boolean} visible `true` makes the dialog visible; `false` hides it.
	 */
	const render = ( visible = true ) => {
		const selectedEmbedNode = editor.selection.getNode();
		const store = editor.getParam( 'redux_store' );
		const embedDialogProps = {
			embedUrl: selectedEmbedNode.innerText || selectedEmbedNode.textContent,
			isVisible: visible,
			onCancel: () => render( false ),
			onUpdate: ( newUrl ) => {
				editor.execCommand( 'mceInsertContent', false, newUrl );
				render( false );
			},
		};

		renderWithReduxStore(
			React.createElement( EmbedDialog, embedDialogProps ),
			embedDialogContainer,
			store
		);

		// Focus on the editor when closing the dialog, so that the user can start typing right away
		// instead of having to tab back to the editor.
		if ( ! visible ) {
			editor.focus();
		}
	};

	editor.addCommand( 'embedDialog', () => render() );

	editor.on( 'init', () => {
		embedDialogContainer = editor.getContainer().appendChild( document.createElement( 'div' ) );
	} );

	editor.on( 'remove', () => {
		ReactDom.unmountComponentAtNode( embedDialogContainer );
		embedDialogContainer.parentNode.removeChild( embedDialogContainer );
		embedDialogContainer = null;
	} );
}

export default () => {
	tinymce.PluginManager.add( 'embed', embed );
};
