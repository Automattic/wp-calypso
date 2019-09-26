/**
 * External dependencies
 */
import { pickBy } from 'lodash';

/**
 * Internal dependencies
 */
import { next, parse, stringify } from 'lib/shortcode';

export function serialize( { to, subject, fields = [] } = {} ) {
	const content = fields
		.map( ( { label, type, options, required } ) => {
			if ( ! label || ! type ) {
				return;
			}

			const fieldShortcode = {
				tag: 'contact-field',
				type: 'self-closing',
				attrs: pickBy( { label, type, options } ),
			};

			if ( required ) {
				fieldShortcode.attrs.required = 1;
			}

			return stringify( fieldShortcode );
		} )
		.join( '' );

	return stringify( {
		tag: 'contact-form',
		type: 'closed',
		content,
		attrs: pickBy( { to, subject } ),
	} );
}

export function deserialize( shortcode ) {
	if ( ! shortcode ) {
		return null;
	}

	const parsed = parse( shortcode );

	if ( parsed ) {
		return ( ( { attrs: { named: { to, subject } = {} } = {}, content } ) => {
			const fields = [];
			let parsedField;

			while ( content && ( parsedField = next( 'contact-field', content ) ) ) {
				if ( 'attrs' in parsedField.shortcode ) {
					const { label, type, options, required } = parsedField.shortcode.attrs.named;
					const field = pickBy( { label, type, options, required } );
					if ( 'required' in field ) {
						field.required = true;
					}
					fields.push( field );
				}
				content = content.slice( parsedField.index + parsedField.content.length );
			}

			return pickBy( { to, subject, fields } );
		} )( parsed );
	}

	return {};
}
