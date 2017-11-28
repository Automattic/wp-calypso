/**
 * External dependencies
 */
import { get, isNil, mapValues } from 'lodash';

function handleObject( schema, value ) {
	const schemaProps = get( schema, 'properties', {} );
	const fieldDefault = mapValues( schemaProps, ( propSchema, propId ) => {
		const propValue = get( value, propId, null );
		return getItemValue( propSchema, propValue );
	} );

	return fieldDefault;
}

function getItemValue( schema, value ) {
	switch ( schema.type ) {
		case 'boolean':
			return isNil( value ) ? ( schema.default || false ) : value;
		case 'number':
			return isNil( value ) ? ( schema.default || 0 ) : value;
		case 'string':
		case 'textarea':
			return value || schema.default || '';
		case 'array':
			return value || schema.default || [];
		case 'object':
			return handleObject( schema, value );
		default:
			return null;
	}
}

export default getItemValue;
