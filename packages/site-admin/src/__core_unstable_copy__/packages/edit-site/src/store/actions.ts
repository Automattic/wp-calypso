/**
 * Internal dependencies
 */
import { RouteProps } from '../types';

export function registerRoute( route: RouteProps ) {
	return {
		type: 'REGISTER_ROUTE',
		route,
	};
}
