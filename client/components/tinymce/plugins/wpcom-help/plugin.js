/**
 * External dependencies
 */
const ReactDom = require( 'react-dom' ),
	React = require( 'react' ),
	tinymce = require( 'tinymce/tinymce' );

/**
 * Internal dependencies
 */
const HelpModal = require( './help-modal' );

function wpcomHelpPlugin( editor ) {
	var node;

	editor.on( 'init', function() {
		node = editor.getContainer().appendChild(
			document.createElement( 'div' )
		);
	} );

	editor.on( 'remove', function() {
		ReactDom.unmountComponentAtNode( node );
		node.parentNode.removeChild( node );
		node = null;
	} );

	editor.addCommand( 'Wpcom_Help', function() {
		function onClose() {
			editor.focus();
			render( 'hide' );
		}

		function render( visibility = 'show' ) {
			ReactDom.render(
				React.createElement( HelpModal, {
					showDialog: visibility === 'show' ? true : false,
					onClose: onClose,
					macosx: tinymce.Env.mac
				} ),
				node
			);
		}

		render( 'show' );
	} );
}

module.exports = function() {
	tinymce.PluginManager.add( 'wpcom/help', wpcomHelpPlugin );
};
