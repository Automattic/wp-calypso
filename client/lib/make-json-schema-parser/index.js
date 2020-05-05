/**
 * External dependencies
 */
import schemaValidator from 'is-my-json-valid';
import { get, identity } from 'lodash';

export class SchemaError extends Error {
	constructor( errors ) {
		super( 'Failed to validate with JSON schema' );
		this.schemaErrors = errors;
	}
}

export class TransformerError extends Error {
	constructor( error, data, transformer ) {
		super( error.message );
		this.inputData = data;
		this.transformer = transformer;
	}
}

/**
 * @typedef {Function} Parser
 * @param   {*}        data   Input data
 * @returns {*}                Transformed data
 * @throws {SchemaError}      Error describing failed schema validation
 * @throws {TransformerError} Error ocurred during transformation
 */

/**
 * Create a parser to validate and transform data
 *
 * @param {object}   schema               JSON schema
 * @param {Function} transformer=identity Transformer function
 * @param {object}   schemaOptions={}     Options to pass to schema validator
 *
 * @returns {Parser}                       Function to validate and transform data
 */
export function makeJsonSchemaParser( schema, transformer = identity, schemaOptions = {} ) {
	let transform;
	let validate;

	const genParser = () => {
		const options = Object.assign( { greedy: true, verbose: true }, schemaOptions );
		const validator = schemaValidator( schema, options );

		// filter out unwanted properties even though we may have let them slip past validation
		// note: this property does not nest deeply into the data structure, that is, properties
		// of a property that aren't in the schema could still come through since only the top
		// level of properties are pruned
		const filter = schemaValidator.filter(
			Object.assign(
				{},
				schema,
				schema.type && schema.type === 'object' && { additionalProperties: false }
			)
		);

		validate = ( data ) => {
			if ( ! validator( data ) ) {
				if ( 'development' === process.env.NODE_ENV ) {
					// eslint-disable-next-line no-console
					console.warn( 'JSON Validation Failure' );

					validator.errors.forEach( ( error ) =>
						// eslint-disable-next-line no-console
						console.warn( {
							field: error.field,
							message: error.message,
							value: error.value,
							actualType: error.type,
							expectedType: get( schema, error.schemaPath ),
						} )
					);

					if ( undefined !== window ) {
						// eslint-disable-next-line no-console
						console.log( 'updated `lastValidator` and `lastValidated` in console' );
						// eslint-disable-next-line no-console
						console.log( 'run `lastValidator( lastValidated )` to reproduce failing validation' );
						window.lastValidator = validator;
						window.lastValidated = data;
					}
				}

				throw new SchemaError( validator.errors );
			}

			return filter( data );
		};

		transform = ( data ) => {
			try {
				return transformer( data );
			} catch ( e ) {
				if ( 'development' === process.env.NODE_ENV ) {
					// eslint-disable-next-line no-console
					console.warn( 'Data Transformation Failure' );

					// eslint-disable-next-line no-console
					console.warn( {
						inputData: data,
						error: e,
					} );

					if ( undefined !== window ) {
						// eslint-disable-next-line no-console
						console.log( 'updated `lastTransformer` and `lastTransformed` in console' );
						// eslint-disable-next-line no-console
						console.log(
							'run `lastTransformer( lastTransformed )` to reproduce failing transform'
						);
						window.lastTransformer = transformer;
						window.lastTransformed = data;
					}
				}

				throw new TransformerError( e, data, transformer );
			}
		};
	};

	return ( data ) => {
		if ( ! transform ) {
			genParser();
		}

		return transform( validate( data ) );
	};
}

export default makeJsonSchemaParser;
