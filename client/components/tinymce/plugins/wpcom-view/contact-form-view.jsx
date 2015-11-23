/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependecies
 */
import shortcodeUtils from 'lib/shortcode';

export default React.createClass( {
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
			editor.execCommand( 'WP_ContactForm', content );
		}
	},
	render() {
		return (
			<div className="wpview-content wpview-type-contact-form">
				<p>This is a placeholder for the form preview.</p>
			</div>
		);
	}
} );
