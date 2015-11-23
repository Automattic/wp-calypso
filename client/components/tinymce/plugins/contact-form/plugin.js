/**
 * External Dependencies
 */
import tinymce from 'tinymce/tinymce';
import i18n from 'lib/mixins/i18n';
import React from 'react';

/**
 * Internal Dependencies
 */
import Gridicon from 'components/gridicon';
import layout from './layout';

const contactForm = editor => {
	const $ = editor.$;

	editor.addButton( 'wpcom_add_contact_form', {
		classes: 'btn wpcom-button media',

		title: i18n.translate( 'Add Contact Form' ),

		onPostRender() {
			this.innerHtml( React.renderToStaticMarkup(
				<button type="button" role="presentation">
					<Gridicon icon="grid" size={ 20 } />
				</button>
			) );
		},

		onclick() {
			editor.insertContent('<div class="wpcom-contact-form"></div>');
			React.render( React.createElement( layout ), $('.wpcom-contact-form')[0] );
		}
	} );

	editor.on( 'BeforeSetContent', event => {
		console.log('BeforeSetContent', event);
	} );
};

export default () => {
	tinymce.PluginManager.add( 'wpcom/contactform', contactForm );
}
