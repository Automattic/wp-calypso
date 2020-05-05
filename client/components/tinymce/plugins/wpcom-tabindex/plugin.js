/**
 * External dependencies
 */

import tinymce from 'tinymce/tinymce';

// Returns a function that sets the tabindex on an editor instance.
// The returned function assumes that `this` is set to the editor instance
function setTabIndexOnEditorIframe( tabindex ) {
	return function () {
		// At this point, there's an iframe in the DOM with the id of `${editor.id}_ifr`.
		// Can't find a way to get at it without hopping out to the DOM :/
		const editorIframe = document.getElementById( `${ this.id }_ifr` );

		if ( ! editorIframe ) {
			return;
		}

		editorIframe.setAttribute( 'tabIndex', tabindex );
	};
}

function wpcomTabIndexPlugin( editor ) {
	const settings = editor && editor.settings;

	if ( ! settings || ! ( 'tabindex' in settings ) ) {
		return;
	}

	const tabindex = Math.min( 32767, Number( settings.tabindex ) );
	if ( ! Number.isInteger( tabindex ) ) {
		return;
	}

	editor.on( 'init', setTabIndexOnEditorIframe( tabindex ) );
}

export default function () {
	tinymce.PluginManager.add( 'wpcom/tabindex', wpcomTabIndexPlugin );
}
