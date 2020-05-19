/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Internal dependencies
 */

/**
 * Gets the previous query set by a ROUTE_SET action
 *
 * @param {object} state - global redux state
 * @returns {string} previous query value
 */
export const getPreviousQuery = ( state ) => get( state, 'ui.route.query.previous', '' );

export default getPreviousQuery;
