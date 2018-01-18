/** @format */

/**
 * External dependencies
 */
import jsonSchemaDraft04 from './lib/json-schema-draft-04.json';
import imjv from 'is-my-json-valid';
import { forEach, get, isEmpty } from 'lodash';

const validateSchema = imjv( jsonSchemaDraft04, { verbose: true, greedy: true } );

function throwOnInvalidSchema( schema ) {
	if ( ! validateSchema( schema ) ) {
		const msg = [ 'Invalid schema received', '', JSON.stringify( schema, undefined, 2 ), '' ];
		forEach( validateSchema.errors, ( { field, message, schemaPath, value } ) => {
			// data.myField is required
			msg.push( `${ field } ${ message }` );

			// Found: { my: 'state' }
			msg.push( `Found: ${ JSON.stringify( value ) }` );

			// Violates rule: { type: 'boolean' }
			if ( ! isEmpty( schemaPath ) ) {
				msg.push( `Violates rule: ${ JSON.stringify( get( jsonSchemaDraft04, schemaPath ) ) }` );
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
