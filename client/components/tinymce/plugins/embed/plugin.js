/**
 * External dependencies
 *
 * @format
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
const embed = editor => {
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
			onUpdate: newUrl => {
				editor.execCommand( 'mceInsertContent', false, newUrl );
				render( false );
			},
		};

		renderWithReduxStore( React.createElement( EmbedDialog, embedDialogProps ), embedDialogContainer, store );

		// Focus on the editor when closing the dialog, so that the user can start typing right away
		// instead of having to tab back to the editor.
		if ( ! visible ) {
			editor.focus();
			// maybe it won't be necessary after setting up embed/dialog updating similar to wplink/dialog?
		}
	};

	editor.addCommand( 'embedDialog', () => render() );

	editor.on( 'init', () => {
		embedDialogContainer = editor.getContainer().appendChild( document.createElement( 'div' ) );
	} );

	editor.on( 'remove', () => {
		ReactDom.unmountComponentAtNode( embedDialogContainer );
		{/*
		Warning: unmountComponentAtNode(): Render methods should be a pure function of props and state;
		triggering nested component updates from render is not allowed.
		If necessary, trigger nested updates in componentDidUpdate.
		Check the render method of EmbedDialog.

		shouldn't this only fire when unmounting tinymce and navigating to another page?
		why doesn't this error happen for other plugins like wplink? or maybe it does? check

		this is no longer here now that it's rendered with redux store? i don't see how the two are connected though.
		*/}

		embedDialogContainer.parentNode.removeChild( embedDialogContainer );
		embedDialogContainer = null;
	} );
};

export default () => {
	tinymce.PluginManager.add( 'embed', embed );
};
