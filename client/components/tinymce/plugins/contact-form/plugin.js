/**
 * External Dependencies
 */
import tinymce from 'tinymce/tinymce';
import i18n from 'lib/mixins/i18n';
import ReactDom from 'react-dom';
import ReactDomServer from 'react-dom/server';
import React from 'react';

/**
 * Internal Dependencies
 */
import Gridicon from 'components/gridicon';
import ContactFormDialog from './dialog';

const contactForm = editor => {
	let node;

	editor.on( 'init', () => {
		node = editor.getContainer().appendChild(
			document.createElement( 'div' )
		);
	} );

	editor.on( 'remove', () => {
		ReactDom.unmountComponentAtNode( node );
		node.parentNode.removeChild( node );
		node = null;
	} );

	editor.addCommand( 'WP_ContactForm', () => {
		function onClose() {
			editor.focus();
			renderModal( 'hide' );
		};

		function renderModal( visibility = 'show' ) {
			ReactDom.render(
				React.createElement( ContactFormDialog, {
					showDialog: visibility === 'show',
					onClose,
					onInsertMedia( markup ) {
						editor.execCommand( 'mceInsertContent', false, markup );
					}
				} ),
				node
			);
		};

		renderModal();
	} );

	editor.addButton( 'wpcom_add_contact_form', {
		classes: 'btn wpcom-button contact-form',
		title: i18n.translate( 'Add Contact Form' ),
		cmd: 'WP_ContactForm',
		onPostRender() {
			this.innerHtml( ReactDomServer.renderToStaticMarkup(
				<button type="button" role="presentation">
					<Gridicon icon="grid" size={ 20 } />
				</button>
			) );
		}
	} );
};

export default () => {
	tinymce.PluginManager.add( 'wpcom/contactform', contactForm );
}
