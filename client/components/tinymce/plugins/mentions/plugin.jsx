/**
 * External dependencies
 */
import tinymce from 'tinymce/tinymce';
import ReactDom from 'react-dom';
import React from 'react';

/**
 * Internal dependencies
 */
import Client from './rest-client';
import Mentions from './mentions';

const sites = require( 'lib/sites-list' )();
const client = new Client();

function mentions( editor ) {
	let node, siteId;

	editor.on( 'init', () => {
		node = document.createElement( 'div' );
		siteId = sites.getSelectedSite() ? sites.getSelectedSite().ID : null;

		node.setAttribute( 'class', 'mention' );
		editor.getContainer().appendChild( node );

		ReactDom.render(
			<Mentions
				siteId={ siteId }
				client={ client }
				editor={ editor }
			/>,
			node
		);
	} );
}

export default () => {
	tinymce.PluginManager.add( 'wpcom/mentions', mentions );
};
