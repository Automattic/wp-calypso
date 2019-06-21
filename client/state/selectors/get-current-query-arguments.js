/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * @typedef {import('querystring').ParsedUrlQuery} Query
 */

/**
 * Gets the last query parameters set by a ROUTE_SET action
 * @param {Object} state - global redux state
 * @return {(Query|false)} Initial state is false, otherwise this should be a query object
 */
export const getCurrentQueryArguments = state =>
	get( state, [ 'ui', 'route', 'query', 'current' ] );

export default getCurrentQueryArguments;
