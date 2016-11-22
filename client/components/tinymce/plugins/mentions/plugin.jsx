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
	editor.on( 'init', () => {
		const node = document.createElement( 'div' );

		editor.getContainer().appendChild( node );

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
