/**
 * External dependencies
 *
 * @format
 */

import { get } from 'lodash';

/**
 * Internal dependencies
 */

/**
 * Gets the initial query parameters set by a ROUTE_SET action
 * @param {Object} state - global redux state
 * @return {Object} initial query arguments
 */
export const getInitialQueryArguments = state => get( state, 'ui.route.query.initial', null );

export default getInitialQueryArguments;
