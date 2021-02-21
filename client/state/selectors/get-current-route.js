/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/route/init';

/**
 * Gets the last route set by a ROUTE_SET action
 *
 * @param {object} state - global redux state
 * @returns {string} current route value
 */
export const getCurrentRoute = ( state ) => get( state, 'route.path.current', null );

export default getCurrentRoute;
