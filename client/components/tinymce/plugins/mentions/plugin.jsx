/**
 * External dependencies
 */
import tinymce from 'tinymce/tinymce';
import ReactDom from 'react-dom';
import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';

/**
 * Internal dependencies
 */
import Mentions from './mentions';

function mentions( editor ) {
	const node = document.createElement( 'div' );

	// Adjust the position of the element in which the Mentions component renders so that it is
	// just below the cursor.
	function setNodePosition() {
		const mceToolbar = tinymce.$( '.mce-toolbar-grp', editor.getContainer() )[ 0 ];
		const nodePosition = tinymce.$( editor.selection.getNode() ).offset();
		const rectList = editor.selection.getRng().getClientRects();
		let left = 0;

		if ( rectList.length > 0 ) {
			left = rectList[ 0 ].left;
		} else {
			left = nodePosition.left;
		}

		node.style.left = left + 'px';
		node.style.top = nodePosition.top + mceToolbar.offsetHeight + editor.selection.getNode().offsetHeight + 'px';
	}

	editor.on( 'init', () => {
		node.setAttribute( 'class', 'mentions__container' );
		editor.getContainer().appendChild( node );
		editor.on( 'keyup', setNodePosition );

		ReactDom.render(
			<ReduxProvider store={ editor.getParam( 'redux_store' ) }>
				<Mentions editor={ editor } />
			</ReduxProvider>,
			node
		);
	} );
}

export default () => {
	tinymce.PluginManager.add( 'wpcom/mentions', mentions );
};
