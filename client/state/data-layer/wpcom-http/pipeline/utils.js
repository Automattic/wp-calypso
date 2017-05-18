/**
 * External dependencies
 */
import {
	get,
	head,
	sortBy,
	toPairs,
} from 'lodash';

/**
 * Generate a deterministic key for comparing request descriptions
 *
 * @param {String} path API endpoint path
 * @param {String} apiNamespace used for endpoint versioning
 * @param {String} apiVersion used for endpoint versioning
 * @param {Object<String, *>} query GET query string
 * @returns {String} unique key up to duplicate request descriptions
 */
export const buildKey = ( { path, apiNamespace, apiVersion, query } ) => JSON.stringify( [
	path,
	apiNamespace,
	apiVersion,
	sortBy( toPairs( query ), head ),
] );

/**
 * Determines if a request object specifies the GET HTTP method
 *
 * @param {Object} request the HTTP request action
 * @returns {Boolean} whether or not the method is GET
 */
export const isGetRequest = request => 'GET' === get( request, 'method', '' ).toUpperCase();
