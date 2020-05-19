/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Internal dependencies
 */

/**
 * Gets the last query parameters set by a ROUTE_SET action
 *
 * @param {object} state - global redux state
 * @returns {object} current state value
 */
export const getCurrentQueryArguments = ( state ) => get( state, 'ui.route.query.current', null );

export default getCurrentQueryArguments;
