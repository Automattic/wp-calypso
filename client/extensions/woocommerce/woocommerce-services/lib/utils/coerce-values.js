/**
 * Retrieve a field's schema, handling referenced schema definitions if need be.
 *
 * @param {object} fieldSchema - Schema object for field.
 * @param {object} definitions - Common definitions.
 * @returns {object} - Schema object for field, potentially pulled from $ref's definition.
 */
const getFieldSchema = ( fieldSchema, definitions ) => {
	if ( fieldSchema.$ref ) {
		const definitionKey = fieldSchema.$ref.match( /^#\/definitions\/(.+)/ );

		if ( definitionKey && definitions[ definitionKey[ 1 ] ] ) {
			fieldSchema = definitions[ definitionKey[ 1 ] ];
		}
	}
	return fieldSchema;
};

/**
 * Coerces a value into a type.
 *
 * @param {object} schema - Schema containing type declarations.
 * @param {*} value - Value to coerce.
 * @param {object} definitions - Schema definitions.
 * @returns {*} - Coerced value.
 */
export const coerceValue = ( schema, value, definitions ) => {
	// If the value is undefined or we don't have a schema type to reference, leave it be.
	if ( undefined === value || null === value || ! schema ) {
		return value;
	}
	schema = getFieldSchema( schema, definitions );

	switch ( schema.type ) {
		case 'number':
			if ( '' === value ) {
				return undefined;
			}

			if ( ! isNaN( value ) ) {
				return parseFloat( value );
			}

			return value;

		case 'boolean':
			const truthy = [ 'true', 'True', 'TRUE', '1', 1, true ];
			const falsy = [ 'false', 'False', 'FALSE', '0', 0, false ];

			if ( -1 !== truthy.indexOf( value ) ) {
				return true;
			}

			if ( -1 !== falsy.indexOf( value ) ) {
				return false;
			}

			return undefined;

		case 'string':
			return value ? value.toString() : '';

		case 'object':
			const coerced = {};
			Object.keys( value ).forEach( ( key ) => {
				const fieldSchema = ( schema.properties || {} )[ key ];
				coerced[ key ] = coerceValue( fieldSchema, value[ key ], definitions );
			} );
			return coerced;

		case 'array':
			return value.map( ( arrayItem ) => coerceValue( schema.items, arrayItem, definitions ) );

		default:
			return value;
	}
};

/**
 * Coerce a form values object using the provided schema.
 *
 * @param {object} schema - Schema containing type declarations.
 * @param {object} values - Form values.
 * @returns {object} - Coerced values based on schema.
 */
const coerceFormValues = ( schema, values ) => {
	return coerceValue(
		{ type: 'object', properties: schema.properties },
		values,
		schema.definitions
	);
};

export default coerceFormValues;
