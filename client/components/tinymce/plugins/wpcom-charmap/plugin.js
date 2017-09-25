/**
 * External dependencies
 */
import React from 'react';
import ReactDom from 'react-dom';
import tinymce from 'tinymce/tinymce';

/**
 * Internal dependencies
 */
import CharMap from './charmap';

function wpcomCharMapPlugin( editor ) {
	let node;

	editor.on( 'init', function() {
		node = document.createElement( 'div' );
		node.setAttribute( 'class', 'charmap-dialog-container' );
		editor.getContainer().appendChild( node );
	} );

	editor.on( 'remove', function() {
		ReactDom.unmountComponentAtNode( node );
		node.parentNode.removeChild( node );
		node = null;
	} );

	editor.addCommand( 'Wpcom_CharMap', function() {
		function onClose() {
			editor.focus();
			render( 'hide' );
		}

		function render( visibility = 'show' ) {
			ReactDom.render(
				React.createElement( CharMap, {
					showDialog: visibility === 'show',
					onClose: onClose,
					editor: editor
				} ),
				node
			);
		}

		render( 'show' );
	} );
}

export default function() {
	tinymce.PluginManager.add( 'wpcom/charmap', wpcomCharMapPlugin );
}
