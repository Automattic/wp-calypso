/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import { deserialize } from 'components/tinymce/plugins/contact-form/shortcode-utils';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import { next } from 'lib/shortcode';
import renderField from './preview-fields';

const ContactForm = localize( ( { content, translate } ) => {
	const { fields } = deserialize( content );

	return (
		<div className="wpview-content wpview-type-contact-form">
			{ [].concat( fields ).map( renderField ) }
			<Button disabled>{ translate( 'Submit' ) }</Button>
		</div>
	);
} );

export function match( content ) {
	const m = next( 'contact-form', content );

	if ( m ) {
		return {
			index: m.index,
			content: m.content,
			options: {
				shortcode: m.shortcode,
			},
		};
	}
}

export function serialize( content ) {
	return encodeURIComponent( content );
}

export function edit( editor, content ) {
	editor.execCommand( 'wpcomContactForm', content );
}

export function getComponent() {
	return ContactForm;
}
