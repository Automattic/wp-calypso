/** @format */

/**
 * External dependencies
 */
import jsonSchema from './lib/schema.json';
import imjv from 'is-my-json-valid';
import { forEach, get, isEmpty } from 'lodash';

const validateSchema = imjv( jsonSchema, { verbose: true, greedy: true } );

function throwOnInvalidSchema( schema ) {
	if ( ! validateSchema( schema ) ) {
		const msg = [ 'Invalid schema received', '' ];
		forEach( validateSchema.errors, ( { field, message, schemaPath, value } ) => {
			// data.myField is required
			msg.push( `${ field } ${ message }` );

			// Found: { my: 'state' }
			msg.push( `Found: ${ JSON.stringify( value ) }` );

			// Violates rule: { type: 'boolean' }
			if ( ! isEmpty( schemaPath ) ) {
				msg.push( `Violates rule: ${ JSON.stringify( get( jsonSchema, schemaPath ) ) }` );
			}
			msg.push( '' );
		} );
		throw new TypeError( msg.join( '\n' ) );
	}
}

export default function validator( schema, options ) {
	throwOnInvalidSchema( schema );
	return imjv( schema, options );
}

validator.filter = ( schema, options ) => {
	throwOnInvalidSchema( schema );
	return imjv.filter( schema, options );
};
