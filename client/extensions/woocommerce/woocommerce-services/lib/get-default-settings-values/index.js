/**
 * External dependencies
 */
import { get, mapValues } from 'lodash';

function getItemValue( schema ) {
	switch ( schema.type ) {
		case 'boolean':
			return schema.default || false;
		case 'number':
			return schema.default || 0;
		case 'string':
		case 'textarea':
			return schema.default || '';
		case 'array':
			return schema.default || [];
		case 'object':
			return mapValues( get( schema, 'properties', {} ), getItemValue );
		default:
			return null;
	}
}

export default ( schema ) => mapValues( schema.properties, getItemValue );
