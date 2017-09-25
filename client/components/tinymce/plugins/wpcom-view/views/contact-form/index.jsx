/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import renderField from './preview-fields';
import { deserialize } from 'components/tinymce/plugins/contact-form/shortcode-utils';
import shortcodeUtils from 'lib/shortcode';

export default localize( React.createClass( {
	statics: {
		match( content ) {
			const match = shortcodeUtils.next( 'contact-form', content );

			if ( match ) {
				return {
					index: match.index,
					content: match.content,
					options: {
						shortcode: match.shortcode
					}
				};
			}
		},

		serialize( content ) {
			return encodeURIComponent( content );
		},

		edit( editor, content ) {
			editor.execCommand( 'wpcomContactForm', content );
		}
	},

	render() {
		const { fields } = deserialize( this.props.content );

		return (
		    <div className="wpview-content wpview-type-contact-form">
				{ [].concat( fields ).map( renderField ) }
				<button disabled>{ this.props.translate( 'Submit' ) }</button>
			</div>
		);
	}
} ) );
