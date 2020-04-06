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
	const wrapperElementId = 'paste-embed-wrapper';
	let clipboardData = null;

	if ( ! store ) {
		return;
	}

	function replaceMarkup( markup, result ) {
		if ( ! result || ! editor ) {
			return;
		}

		if ( isVisualEditMode() ) {
			const wrapperElement = getWrapperElement();
			const shortCode = editor.dom.create( 'p', {}, result.result );
			wrapperElement.parentNode.insertBefore( shortCode, wrapperElement );
			editor.dom.remove( wrapperElement );
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
		if ( ! isMarkup( markup ) ) {
			return;
		}

		if ( isVisualEditMode() ) {
			// If we're in the visual editor store the markup for use later
			clipboardData = markup;
		} else {
			// Otherwise queue a request for reversal
			queueReversal( markup );
		}
	}

	function queueReversal( markup ) {
		return wpcom
			.undocumented()
			.site( getSelectedSiteId( store.getState() ) )
			.embedReversal( markup )
			.then( partial( replaceMarkup, markup ) )
			.catch( () => {
				const wrapperElement = getWrapperElement();
				if ( wrapperElement && isVisualEditMode() ) {
					editor.dom.remove( wrapperElement, true );
				}
			} )
			.finally( () => ( clipboardData = null ) );
	}

	function getWrapperElement() {
		return editor.getBody().querySelector( '#' + wrapperElementId );
	}

	function isMarkup( markup ) {
		return markup && /^<[\s\S]+>$/.test( markup.trim() );
	}

	function isVisualEditMode() {
		return editor && ! editor.isHidden();
	}

	function postPaste( e ) {
		// Check to see if we've stored some data that looks like markup.
		if ( clipboardData ) {
			const wrapper = editor.dom.create( 'div', { id: wrapperElementId } );
			while ( e.node.firstChild ) {
				const child = e.node.firstChild;
				e.node.removeChild( child );
				wrapper.appendChild( child );
			}
			e.node.appendChild( wrapper );

			queueReversal( clipboardData );
		}
	}

	// Bind paste event listeners to both Visual and HTML editors
	editor.on( 'paste', onPaste );
	editor.on( 'PastePostProcess', postPaste );
	const textarea = editor.getParam( 'textarea' );
	if ( textarea ) {
		textarea.addEventListener( 'paste', onPaste );
	}
}

export default () => {
	tinymce.PluginManager.add( 'wpcom/embedreversal', embedReversal );
};
