import { ROUTE_SET } from 'calypso/state/action-types';

import 'calypso/state/ui/init';

/**
 * Returns an action object signalling that the current route is to be changed
 * @param  {string} path    Route path
 * @param  {Object} [query] Query arguments
 * @returns {Object}         Action object
 */
export function setRoute( path, query = {} ) {
	return {
		type: ROUTE_SET,
		path,
		query,
	};
}
