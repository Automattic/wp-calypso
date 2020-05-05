/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Internal dependencies
 */

/**
 * Gets the initial query parameters set by a ROUTE_SET action
 *
 * @param {object} state - global redux state
 * @returns {object} initial query arguments
 */
export const getInitialQueryArguments = ( state ) => get( state, 'ui.route.query.initial', null );

export default getInitialQueryArguments;
