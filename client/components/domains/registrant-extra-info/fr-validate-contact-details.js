/** @format */

/**
 * External dependencies
 */

import { reduce, update } from 'lodash';
import Ajv from 'ajv';
import debugFactory from 'debug';
import draft04 from 'ajv/lib/refs/json-schema-draft-04.json';

/**
 * Internal dependencies
 */
import validationSchema from './fr-schema';

const debug = debugFactory( 'calypso:components:domains:registrant-extra-info:validation' );

const ajv = new Ajv( { messages: false } );
ajv.addMetaSchema( draft04 );
const validate = ajv.compile( validationSchema );

const schemaPathFilterRegex = /anyOf\/\d+/;

/*
 * @returns errors by field, like: { 'extra.field: name, errors: [ string ] }
 */
export default function validateContactDetails( contactDetails ) {
	// Populate validate.errors
	const valid = validate( contactDetails );
	valid && debug( validate.errors );

	return reduce(
		validate.errors,
		( accumulatedErrors, { dataPath, keyword, schemaPath } ) => {
			// Drop '.' prefix
			const path = dataPath.slice( 1 );

			if ( schemaPathFilterRegex.test( schemaPath ) ) {
				return accumulatedErrors;
			}

			const appendThisMessage = before => [ ...( before || [] ), keyword ];

			return update( accumulatedErrors, path, appendThisMessage );
		},
		{}
	);
}
