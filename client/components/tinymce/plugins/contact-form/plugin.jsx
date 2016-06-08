/**
 * External Dependencies
 */
import tinymce from 'tinymce/tinymce';
import i18n from 'i18n-calypso';
import React, { createElement } from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { renderToStaticMarkup } from 'react-dom/server';
import { Provider } from 'react-redux';

/**
 * Internal Dependencies
 */
import Gridicon from 'components/gridicon';
import ContactFormDialog from './dialog';
import {
	formClear,
	formLoad,
	fieldAdd,
	fieldRemove,
	fieldUpdate,
	settingsUpdate
} from 'state/ui/editor/contact-form/actions';
import { serialize, deserialize } from './shortcode-utils';

const wpcomContactForm = editor => {
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

	editor.addCommand( 'wpcomContactForm', content => {
		let isEdit = false;
		if ( content ) {
			store.dispatch( formLoad( deserialize( content ) ) );
			isEdit = true;
		} else {
			store.dispatch( formClear() );
		}

		function renderModal( visibility = 'show', activeTab = 'fields' ) {
			render(
				createElement( Provider, { store },
					createElement( ContactFormDialog, {
						showDialog: visibility === 'show',
						activeTab,
						isEdit,
						onInsert() {
							const state = store.getState();
							editor.execCommand( 'mceInsertContent', false, serialize( state.ui.editor.contactForm ) );
						},
						onChangeTabs( tab ) {
							renderModal( 'show', tab );
						},
						onClose() {
							store.dispatch( formClear() );
							editor.focus();
							renderModal( 'hide' );
						},
						onFieldAdd() {
							store.dispatch( fieldAdd() )
						},
						onFieldRemove( index ) {
							store.dispatch( fieldRemove( index ) );
						},
						onFieldUpdate( index, field ) {
							store.dispatch( fieldUpdate( index, field ) );
						},
						onSettingsUpdate( settings ) {
							store.dispatch( settingsUpdate( settings ) );
						}
					} )
				),
				node
			);
		};

		renderModal();
	} );

	editor.addButton( 'wpcom_add_contact_form', {
		classes: 'btn wpcom-icon-button contact-form',
		title: i18n.translate( 'Add Contact Form' ),
		cmd: 'wpcomContactForm',
		onPostRender() {
			this.innerHtml( renderToStaticMarkup(
				<button type="button" role="presentation">
					<Gridicon icon="mention" />
				</button>
			) );
		}
	} );
};

export default () => {
	tinymce.PluginManager.add( 'wpcom/contactform', wpcomContactForm );
}
