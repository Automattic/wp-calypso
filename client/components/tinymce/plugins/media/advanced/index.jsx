/**
 * External dependencies
 */
import React from 'react';
import ReactDomServer from 'react-dom/server';

/**
 * Internal dependencies
 */
import i18n from 'lib/mixins/i18n';
import config from 'config';
import { toggleEditorMediaAdvanced } from 'state/ui/editor/media/actions';
import Gridicon from 'components/gridicon';

export default function( editor ) {
	const store = editor.getParam( 'redux_store' );
	if ( ! config.isEnabled( 'post-editor/media-advanced' ) || ! store ) {
		return;
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
			store.dispatch( toggleEditorMediaAdvanced() );
		}
	} );
}
