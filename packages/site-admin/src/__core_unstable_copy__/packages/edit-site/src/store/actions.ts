/**
 * Internal dependencies
 */

import { Route } from '../../../router/src';

export function registerRoute( route: Route ) {
	return {
		type: 'REGISTER_ROUTE',
		route,
	};
}
