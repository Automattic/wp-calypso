/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import { deserialize } from 'components/tinymce/plugins/contact-form/shortcode-utils';

/**
 * Internal dependecies
 */
import shortcodeUtils from 'lib/shortcode';
import renderField from './preview-fields';

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
