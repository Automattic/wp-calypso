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
import { getSelectedSite } from 'state/ui/selectors';

/**
 * Module variables
 */
const { ENTER } = tinymce.util.VK;

function mentions( editor ) {
	const node = document.createElement( 'div' );
	let isRendered = false;

	editor.on( 'init focus', () => {
		const store = editor.getParam( 'redux_store' );
		const selectedSite = getSelectedSite( store.getState() );

		if ( ! isRendered && selectedSite && ! selectedSite.single_user_site ) {
			node.setAttribute( 'class', 'mentions__container' );
			editor.getContainer().appendChild( node );

			ReactDom.render(
				<ReduxProvider store={ store }>
					<Mentions editor={ editor } node={ node } />
				</ReduxProvider>,
				node
			);

			isRendered = true;
		}

		if ( isRendered && selectedSite && selectedSite.single_user_site ) {
			ReactDom.unmountComponentAtNode( node );
			isRendered = false;
		}
	} );

	// Cancel Enter key press if the popover is visible.
	// Doing this in the Mentions component is too late.
	editor.on( 'keydown', ( event ) => {
		if ( document.querySelector( '.mentions__suggestions' ) && event.keyCode === ENTER ) {
			event.preventDefault();
		}
	} );
}

export default () => {
	tinymce.PluginManager.add( 'wpcom/mentions', mentions );
};
