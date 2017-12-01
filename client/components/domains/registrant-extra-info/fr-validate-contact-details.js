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

const ajv = new Ajv( { messages: false, extendRefs: true, verbose: true, allErrors: true } );
ajv.addMetaSchema( draft04 );
const validate = ajv.compile( validationSchema );

const schemaPathFilterRegex = /anyOf\/\d+/;

export function inferFormField( { keyword, params, dataPath } ) {
	const possiblePathAddition =
		keyword === 'required' && params && params.missingProperty
			? `.${ params.missingProperty }`
			: '';

	return ( dataPath + possiblePathAddition ).slice( 1 );
}

/*
 * @returns errors by field, like: { 'extra.field: name, errors: [ string ] }
 */
export default function validateContactDetails( contactDetails ) {
	// Populate validate.errors
	const valid = validate( contactDetails );
	valid || debug( validate.errors );

	return reduce(
		validate.errors,
		( accumulatedErrors, validationError ) => {
			// Drop '.' prefix
			const { keyword, schemaPath, schema } = validationError;

			if ( schemaPathFilterRegex.test( schemaPath ) ) {
				return accumulatedErrors;
			}

			const formFieldPath = schema.formField || inferFormField( validationError );

			const appendThisMessage = before => [ ...( before || [] ), keyword ];

			return update( accumulatedErrors, formFieldPath, appendThisMessage );
		},
		{}
	);
}
