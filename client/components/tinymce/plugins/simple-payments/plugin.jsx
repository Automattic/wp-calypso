/**
 * External Dependencies
 */
import tinymce from 'tinymce/tinymce';
import { createElement } from 'react';
import { unmountComponentAtNode } from 'react-dom';

/**
 * Internal Dependencies
 */
import SimplePaymentsDialog from './dialog';
import { renderWithReduxStore } from 'lib/react-helpers';

const simplePayments = editor => {
	let node;
	const store = editor.getParam( 'redux_store' );

	editor.on( 'init', () => {
		node = editor.getContainer().appendChild(
			document.createElement( 'div' )
		);
	} );

	editor.on( 'remove', () => {
		unmountComponentAtNode( node );
		node.parentNode.removeChild( node );
		node = null;
	} );

	editor.addCommand( 'simplePaymentsButton', content => {
		let isEdit = false;
		if ( content ) {
			isEdit = true;
		}

		function renderModal( visibility = 'show', activeTab = 'paymentButtons' ) {
			renderWithReduxStore(
				createElement( SimplePaymentsDialog, {
					showDialog: visibility === 'show',
					activeTab,
					isEdit,
					onClose() {
						editor.focus();
						renderModal( 'hide' );
					},
					onChangeTabs( tab ) {
						renderModal( 'show', tab );
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
	tinymce.PluginManager.add( 'wpcom/simplepayments', simplePayments );
};
