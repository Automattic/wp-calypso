/**
 * External dependencies
 */
import { get, forOwn } from 'lodash';

/**
 * Internal dependencies
 */
import apiResponseSchema from './schema';
import makeJsonSchemaParser from 'calypso/lib/make-json-schema-parser';

/**
 * Transforms API response into array of activities
 *
 * @param  {object} apiResponse API response body
 * @returns {object}             Object with an entry for proccessed item objects and another for oldest item timestamp
 */
export function transformer( apiResponse ) {
	const groups = [];
	forOwn( get( apiResponse, [ 'groups' ], {} ), ( group, slug ) => {
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
