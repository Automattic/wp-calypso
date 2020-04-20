/**
 * External dependencies
 */

import ReactDom from 'react-dom';
import React from 'react';
import tinymce from 'tinymce/tinymce';

/**
 * Internal dependencies
 */
import HelpModal from './help-modal';

function wpcomHelpPlugin( editor ) {
	let node;

	editor.on( 'init', function () {
		node = editor.getContainer().appendChild( document.createElement( 'div' ) );
	} );

	editor.on( 'remove', function () {
		ReactDom.unmountComponentAtNode( node );
		node.parentNode.removeChild( node );
		node = null;
	} );

	editor.addCommand( 'WP_Help', function () {
		function onClose() {
			editor.focus();
			render( 'hide' );
		}

		function render( visibility = 'show' ) {
			ReactDom.render(
				React.createElement( HelpModal, {
					showDialog: visibility === 'show' ? true : false,
					onClose: onClose,
					macosx: tinymce.Env.mac,
				} ),
				node
			);
		}

		render( 'show' );
	} );
}

export default function () {
	tinymce.PluginManager.add( 'wpcom/help', wpcomHelpPlugin );
}
