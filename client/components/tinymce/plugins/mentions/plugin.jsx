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
import sitesFactory from 'lib/sites-list';

const sites = sitesFactory();

function mentions( editor ) {
	let node, siteId;

	editor.on( 'init', () => {
		node = document.createElement( 'div' );
		siteId = sites.getSelectedSite() ? sites.getSelectedSite().ID : null;

		node.setAttribute( 'class', 'mention' );
		editor.getContainer().appendChild( node );

		ReactDom.render(
			<ReduxProvider store={ editor.getParam( 'redux_store' ) }>
				<Mentions
					siteId={ siteId }
					editor={ editor }
				/>
			</ReduxProvider>,
			node
		);
	} );
}

export default () => {
	tinymce.PluginManager.add( 'wpcom/mentions', mentions );
};
