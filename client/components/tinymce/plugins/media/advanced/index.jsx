/**
 * External dependencies
 */
import Gridicon from 'gridicons';
import i18n from 'i18n-calypso';
import React from 'react';
import ReactDom from 'react-dom';
import ReactDomServer from 'react-dom/server';

/**
 * Internal dependencies
 */
import config from 'config';
import * as MediaSerialization from 'lib/media-serialization';
import { renderWithReduxStore } from 'lib/react-helpers';
import EditorMediaAdvanced from 'post-editor/editor-media-advanced';

export default function( editor ) {
	const store = editor.getParam( 'redux_store' );
	if ( ! config.isEnabled( 'post-editor/media-advanced' ) || ! store ) {
		return;
	}

	let container;
	function render( visible = true, item ) {
		if ( ! container ) {
			container = editor.getContainer().appendChild(
				document.createElement( 'div' )
			);
		}

		if ( ! visible ) {
			return unmount();
		}

		renderWithReduxStore(
			<EditorMediaAdvanced
				{ ...{ visible, item } }
				onClose={ hideModal }
				insertMedia={ insertMedia } />,
			container,
			store
		);
	}

	function showModal( item ) {
		render( true, item );
	}

	function hideModal() {
		render( false );
	}

	function unmount() {
		if ( container ) {
			ReactDom.unmountComponentAtNode( container );
		}
	}

	function insertMedia( markup ) {
		editor.execCommand( 'mceInsertContent', false, markup );
		hideModal();
	}

	editor.addButton( 'wp_img_advanced', {
		tooltip: i18n.translate( 'Edit', { context: 'verb' } ),

		classes: 'toolbar-segment-start',

		onPostRender() {
			this.innerHtml( ReactDomServer.renderToStaticMarkup(
				<button type="button" role="presentation" tabIndex="-1">
					<Gridicon icon="pencil" size={ 18 } />
				</button>
			) );
		},

		onClick() {
			const node = editor.selection.getStart();
			const item = MediaSerialization.deserialize( node );
			showModal( item );
		}
	} );

	editor.on( 'remove', unmount );
}
