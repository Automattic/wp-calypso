/** @format */

/**
 * External dependencies
 */

import tinymce from 'tinymce/tinymce';
import { includes, partial } from 'lodash';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getEditorRawContent } from 'state/ui/editor/selectors';

function embedReversal( editor ) {
	const store = editor.getParam( 'redux_store' );
	if ( ! store ) {
		return;
	}

	function replaceMarkup( markup, result ) {
		if ( ! result || ! editor ) {
			return;
		}

		const isVisualEditMode = ! editor.isHidden();

		if ( isVisualEditMode ) {
			// Check textContent of all elements in Visual editor body
			for ( const element of editor.getBody().querySelectorAll( '*' ) ) {
				if ( includes( element.textContent, markup ) ) {
					element.textContent = element.textContent.replace( markup, result.result );
					editor.undoManager.add();
					break;
				}
			}
		} else {
			// Else set the textarea content from store raw content
			let content = getEditorRawContent( store.getState() );
			if ( ! includes( content, markup ) ) {
				return;
			}

			content = content.replace( markup, result.result );
			editor.fire( 'SetTextAreaContent', { content } );
		}

		// Trigger an editor change so that dirty detection and autosave
		// take effect
		editor.fire( 'change' );
	}

	function onPaste( event ) {
		let markup;
		if ( event.clipboardData ) {
			markup = event.clipboardData.getData( 'text/plain' );
		} else if ( window.clipboardData ) {
			markup = window.clipboardData.getData( 'Text' ); // IE11
		}

		// Check whether pasted content looks like markup
		if ( ! markup || ! /^<.*>$/.test( markup ) ) {
			return;
		}

		// If so, queue a request for reversal
		wpcom
			.undocumented()
			.site( getSelectedSiteId( store.getState() ) )
			.embedReversal( markup )
			.then( partial( replaceMarkup, markup ) )
			.catch( () => {} );
	}

	// Bind paste event listeners to both Visual and HTML editors
	editor.on( 'paste', onPaste );
	const textarea = editor.getParam( 'textarea' );
	if ( textarea ) {
		textarea.addEventListener( 'paste', onPaste );
	}
}

export default () => {
	tinymce.PluginManager.add( 'wpcom/embedreversal', embedReversal );
};
