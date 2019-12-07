/** @format */

/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Internal dependencies
 */

/**
 * Gets the previous query set by a ROUTE_SET action
 * @param {Object} state - global redux state
 * @return {string} previous query value
 */
export const getPreviousQuery = state => get( state, 'ui.route.query.previous', '' );

export default getPreviousQuery;
