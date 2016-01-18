/**
 * External dependencies
 */
import React from 'react';
import ReactDom from 'react-dom';
import ReactDomServer from 'react-dom/server';
import { Provider as ReduxProvider } from 'react-redux';

/**
 * Internal dependencies
 */
import i18n from 'lib/mixins/i18n';
import * as MediaSerialization from 'lib/media-serialization';
import config from 'config';
import { setEditorMediaEditItem } from 'state/ui/editor/media/actions';
import Gridicon from 'components/gridicon';
import EditorMediaAdvanced from 'post-editor/editor-media-advanced';

export default function( editor ) {
	const store = editor.getParam( 'redux_store' );
	if ( ! config.isEnabled( 'post-editor/media-advanced' ) || ! store ) {
		return;
	}

	let container;
	function render() {
		container = editor.getContainer().appendChild( document.createElement( 'div' ) );
		ReactDom.render(
			<ReduxProvider store={ store }>
				<EditorMediaAdvanced insertMedia={ insertMedia } />
			</ReduxProvider>,
			container
		);
	}

	function unmount() {
		ReactDom.unmountComponentAtNode( container );
	}

	function insertMedia( markup ) {
		editor.execCommand( 'mceInsertContent', false, markup );
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

			store.dispatch( setEditorMediaEditItem( item ) );
		}
	} );

	editor.on( 'init', render );
	editor.on( 'remove', unmount );
}
