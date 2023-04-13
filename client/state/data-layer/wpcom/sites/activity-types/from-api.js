import { get } from 'lodash';
import makeJsonSchemaParser from 'calypso/lib/make-json-schema-parser';
import apiResponseSchema from './schema';

/**
 * Transforms API response into array of activities
 *
 * @param  {Object} apiResponse API response body
 * @returns {Object}             Object with an entry for proccessed item objects and another for oldest item timestamp
 */
export function transformer( apiResponse ) {
	const groups = [];
	Object.entries( get( apiResponse, [ 'groups' ], {} ) ).forEach( ( [ slug, group ] ) => {
		groups.push( {
			key: slug,
			name: group.name,
			count: group.count,
		} );
	} );
	return groups;
}
// fromApi default export
export default makeJsonSchemaParser( apiResponseSchema, transformer );
