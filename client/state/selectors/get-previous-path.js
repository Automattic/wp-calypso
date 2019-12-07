/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Internal dependencies
 */

/**
 * Gets the previous path set by a ROUTE_SET action
 * @param {Object} state - global redux state
 * @return {string} previous path value
 */
export const getPreviousPath = state => get( state, 'ui.route.path.previous', '' );

export default getPreviousPath;
