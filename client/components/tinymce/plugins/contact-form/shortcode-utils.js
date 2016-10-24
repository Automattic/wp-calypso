/**
 * External dependencies
 */
import pickBy from 'lodash/pickBy';

/**
 * Internal dependencies
 */
import Shortcode from 'lib/shortcode';

export function serialize( { to, subject, fields = [] } = {} ) {
	const content = fields.map( ( { label, type, options, required } ) => {
		if ( ! label || ! type ) {
			return;
		}

		let fieldShortcode = {
			tag: 'contact-field',
			type: 'self-closing',
			attrs: pickBy( { label, type, options } )
		};

		if ( required ) {
			fieldShortcode.attrs.required = 1;
		}

		return Shortcode.stringify( fieldShortcode );
	} ).join( '' );

	return Shortcode.stringify( {
		tag: 'contact-form',
		type: 'closed',
		content,
		attrs: pickBy( { to, subject } )
	} );
};

export function deserialize( shortcode ) {
	if ( ! shortcode ) {
		return null;
	}

	const parsed = Shortcode.parse( shortcode );

	if ( parsed ) {
		return ( ( { attrs: { named: { to, subject } = {} } = {}, content } ) => {
			let fields = [];
			let parsedField;

			while ( content && ( parsedField = Shortcode.next( 'contact-field', content ) ) ) {
				if ( 'attrs' in parsedField.shortcode ) {
					const { label, type, options, required } = parsedField.shortcode.attrs.named;
					let field = pickBy( { label, type, options, required } );
					if ( 'required' in field ) {
						field.required = true;
					}
					fields.push( field );
				}
				content = content.slice( parsedField.index + parsedField.content.length )
			}

			return pickBy( { to, subject, fields } );
		} )( parsed );
	}

	return {};
}
