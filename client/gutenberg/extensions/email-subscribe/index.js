/** @format */

/**
 * Internal dependencies
 */
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';
import EmailSubscribeEdit from './edit';

export const name = 'email-subscribe';

export const settings = {
	title: __( 'Email Subscribe', 'jetpack' ),
	icon: 'email',
	category: 'widgets',
	keywords: [ __( 'email', 'jetpack' ), __( 'mailchimp', 'jetpack' ), 'jetpack' ],

	edit: EmailSubscribeEdit,

	// We will generate shortcode as a fallback, so that this works even if gutenberg does not.
	save: function( props ) {
		let attrs = '';
		if ( props.attributes ) {
			attrs =
				' ' +
				Object.keys( props.attributes )
					.filter( function( key ) {
						return props.attributes[ key ];
					} )
					.map( function( key ) {
						return key + '="' + props.attributes[ key ].replace( '"', "'" ) + '"';
					} )
					.join( ' ' );
		}
		return '[jetpack-email-subscribe' + attrs + ']';
	},
};
