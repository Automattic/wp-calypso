/**
 * External dependencies
 */
import pick from 'lodash/object/pick';
import identity from 'lodash/utility/identity';

/**
 * Internal dependencies
 */
import Shortcode from 'lib/shortcode';

export function serialize( { to, subject, fields = [] } = {} ) {
	const content = fields.map( ( { label, type, required } ) => {
		if ( ! label || ! type ) {
			return;
		}

		let fieldShortcode = {
			tag: 'contact-field',
			type: 'self-closing',
			attrs: { label, type }
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
		attrs: pick( { to, subject }, identity )
	} );
};

export function deserialize( shortcode ) {
	if ( ! shortcode ) {
		return null;
	}

	const parsed = Shortcode.parse( shortcode );

	if ( parsed ) {
		return ( { attrs: { named: { to, subject } = {} } = {}, content } ) => {
			let fields = [];
			let field;

			while ( content && ( field = Shortcode.next( 'contact-field', content ) ) ) {
				if ( 'attrs' in field.shortcode ) {
					fields.push( field.shortcode.attrs.named );
				}
				content = content.slice( field.index + field.content.length )
			}

			return pick( { to, subject, fields }, identity );
		}( parsed );
	}

	return {};
}
