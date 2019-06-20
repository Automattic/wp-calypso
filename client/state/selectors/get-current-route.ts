/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Gets the last route set by a ROUTE_SET action
 * @param {Object} state - global redux state
 * @return  current route value
 */
export const getCurrentRoute = state => get( state, [ 'ui', 'route', 'path', 'current' ], null );

export default getCurrentRoute;
