/** @format */

/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Internal dependencies
 */

/**
 * Gets the last route set by a ROUTE_SET action
 * @param {Object} state - global redux state
 * @return {string} current route value
 */
export const getCurrentRoute = state => get( state, 'ui.route.path.current', null );

export default getCurrentRoute;
