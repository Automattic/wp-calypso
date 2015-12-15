/**
 * External dependencies
 */
import tinymce from 'tinymce/tinymce';
import ReactDom from 'react-dom';
import React from 'react';

/**
 * Internal dependencies
 */
import Alert from './alert';

function calypsoAlert( editor ) {
	let node;

	editor.on( 'init', function() {
		node = document.createElement( 'div' );
		node.setAttribute( 'class', 'alert-container' );
		editor.getContainer().appendChild( node );

		editor.windowManager.alert = function( message, callback, scope ) {
			function onClose() {
				render( 'hide' );
				if ( typeof callback === 'function' ) {
					callback.call( scope || editor.windowManager );
				} else {
					editor.focus();
				}
			}

			function render( visibility = 'show' ) {
				ReactDom.render(
					<Alert
						isVisible={ visibility === 'show' }
						onClose={ onClose }
						message={ editor.editorManager.i18n.translate( message ) }
					/>,
					node
				);
			}

			render( 'show' );
		};
	} );

	editor.on( 'remove', function() {
		ReactDom.unmountComponentAtNode( node );
		node.parentNode.removeChild( node );
		node = null;
	} );
}

export default () => {
	tinymce.PluginManager.add( 'wpcom/calypsoalert', calypsoAlert );
};
