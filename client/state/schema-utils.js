/** @format */

/**
 * External dependencies
 */
import validator from 'is-my-json-valid';
import { forEach, isEmpty, get, noop } from 'lodash';

/**
 * Throw an error if not in production and schema is not valid according to spec.
 *
 * This is intended to catch invalid schemas early in development rather than shipping
 * hard to track down bugs.
 *
 * @param {Object} schema Schema to validate against the draft spec schema
 * @throws An error if the schema is invalid according to spec
 */
export const throwIfSchemaInvalid = ( () => {
	if ( process.env.NODE_ENV === 'production' ) {
		return noop;
	}

	// JSON Schema meta-schema draft-04 from http://json-schema.org/draft-04/schema
	// Used to validate a JSON schema schema
	// The schema is inlined here so it can be easily pruned from production builds.
	const jsonSchemaSchema = {
		id: 'http://json-schema.org/draft-04/schema#',
		$schema: 'http://json-schema.org/draft-04/schema#',
		description: 'Core schema meta-schema',
		definitions: {
			schemaArray: {
				type: 'array',
				minItems: 1,
				items: { $ref: '#' },
			},
			positiveInteger: {
				type: 'integer',
				minimum: 0,
			},
			positiveIntegerDefault0: {
				allOf: [ { $ref: '#/definitions/positiveInteger' }, { default: 0 } ],
			},
			simpleTypes: {
				enum: [ 'array', 'boolean', 'integer', 'null', 'number', 'object', 'string' ],
			},
			stringArray: {
				type: 'array',
				items: { type: 'string' },
				minItems: 1,
				uniqueItems: true,
			},
		},
		type: 'object',
		properties: {
			id: {
				type: 'string',
				format: 'uri',
			},
			$schema: {
				type: 'string',
				format: 'uri',
			},
			title: {
				type: 'string',
			},
			description: {
				type: 'string',
			},
			default: {},
			multipleOf: {
				type: 'number',
				minimum: 0,
				exclusiveMinimum: true,
			},
			maximum: {
				type: 'number',
			},
			exclusiveMaximum: {
				type: 'boolean',
				default: false,
			},
			minimum: {
				type: 'number',
			},
			exclusiveMinimum: {
				type: 'boolean',
				default: false,
			},
			maxLength: { $ref: '#/definitions/positiveInteger' },
			minLength: { $ref: '#/definitions/positiveIntegerDefault0' },
			pattern: {
				type: 'string',
				format: 'regex',
			},
			additionalItems: {
				anyOf: [ { type: 'boolean' }, { $ref: '#' } ],
				default: {},
			},
			items: {
				anyOf: [ { $ref: '#' }, { $ref: '#/definitions/schemaArray' } ],
				default: {},
			},
			maxItems: { $ref: '#/definitions/positiveInteger' },
			minItems: { $ref: '#/definitions/positiveIntegerDefault0' },
			uniqueItems: {
				type: 'boolean',
				default: false,
			},
			maxProperties: { $ref: '#/definitions/positiveInteger' },
			minProperties: { $ref: '#/definitions/positiveIntegerDefault0' },
			required: { $ref: '#/definitions/stringArray' },
			additionalProperties: {
				anyOf: [ { type: 'boolean' }, { $ref: '#' } ],
				default: {},
			},
			definitions: {
				type: 'object',
				additionalProperties: { $ref: '#' },
				default: {},
			},
			properties: {
				type: 'object',
				additionalProperties: { $ref: '#' },
				default: {},
			},
			patternProperties: {
				type: 'object',
				additionalProperties: { $ref: '#' },
				default: {},
			},
			dependencies: {
				type: 'object',
				additionalProperties: {
					anyOf: [ { $ref: '#' }, { $ref: '#/definitions/stringArray' } ],
				},
			},
			enum: {
				type: 'array',
				minItems: 1,
				uniqueItems: true,
			},
			type: {
				anyOf: [
					{ $ref: '#/definitions/simpleTypes' },
					{
						type: 'array',
						items: { $ref: '#/definitions/simpleTypes' },
						minItems: 1,
						uniqueItems: true,
					},
				],
			},
			allOf: { $ref: '#/definitions/schemaArray' },
			anyOf: { $ref: '#/definitions/schemaArray' },
			oneOf: { $ref: '#/definitions/schemaArray' },
			not: { $ref: '#' },
		},
		dependencies: {
			exclusiveMaximum: [ 'maximum' ],
			exclusiveMinimum: [ 'minimum' ],
		},
		default: {},
	};

	const validateSchema = validator( jsonSchemaSchema, { greedy: true, verbose: true } );
	return schema => {
		if ( ! validateSchema( schema ) ) {
			const validationErrorDescriptionParts = [ 'Invalid schema provided. Errors:', '' ];
			forEach( validateSchema.errors, ( { field, message, schemaPath, value } ) => {
				// data.myField is required
				validationErrorDescriptionParts.push( `${ field } ${ message }` );

				// Found: { my: 'state' }
				validationErrorDescriptionParts.push( `Found: ${ JSON.stringify( value ) }` );

				// Violates rule: { type: 'boolean' }
				if ( ! isEmpty( schemaPath ) ) {
					validationErrorDescriptionParts.push(
						`Violates rule: ${ JSON.stringify( get( jsonSchemaSchema, schemaPath ) ) }`
					);
				}
				validationErrorDescriptionParts.push( '' );
			} );

			throw new Error( validationErrorDescriptionParts.join( '\n' ) );
		}
	};
} )();
