/**
 * Internal dependencies
 */
import { ROUTE_SET } from 'state/action-types';

/**
 * Returns an action object signalling that the current route is to be changed
 *
 * @param  {String} path    Route path
 * @param  {object} [query] Query arguments
 * @return {object}         Action object
 */
export default function setRoute( path, query = {} ) {
	return {
		type: ROUTE_SET,
		path,
		query,
	};
}
