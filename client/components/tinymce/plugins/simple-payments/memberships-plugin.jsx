/**
 * External dependencies
 */

import tinymce from 'tinymce/tinymce';
import { createElement } from 'react';
import { unmountComponentAtNode } from 'react-dom';

/**
 * Internal Dependencies
 */
import MembershipsDialog from './dialog/memberships';
import { serialize, deserialize } from './shortcode-utils';
import { renderWithReduxStore } from 'lib/react-helpers';

const simplePayments = ( editor ) => {
	let node;
	const store = editor.getParam( 'redux_store' );

	editor.on( 'init', () => {
		node = editor.getContainer().appendChild( document.createElement( 'div' ) );
	} );

	editor.on( 'remove', () => {
		unmountComponentAtNode( node );
		node.parentNode.removeChild( node );
		node = null;
	} );

	editor.addCommand( 'membershipsButton', ( content ) => {
		let editPaymentId = null;
		if ( content ) {
			const shortCodeData = deserialize( content );
			editPaymentId = shortCodeData.id || null;
		}

		function renderModal( visibility = 'show' ) {
			renderWithReduxStore(
				createElement( MembershipsDialog, {
					showDialog: visibility === 'show',
					editPaymentId,
					onInsert( productData ) {
						editor.execCommand( 'mceInsertContent', false, serialize( productData ) );
						renderModal( 'hide' );
					},
					onClose() {
						editor.focus();
						renderModal( 'hide' );
					},
				} ),
				node,
				store
			);
		}

		renderModal();
	} );
};

export default () => {
	tinymce.PluginManager.add( 'wpcom/memberships', simplePayments );
};
