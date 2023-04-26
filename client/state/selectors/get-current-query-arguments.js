import { get } from 'lodash';

import 'calypso/state/route/init';

/**
 * Gets the last query parameters set by a ROUTE_SET action
 *
 * @param {Object} state - global redux state
 * @returns {Object.<string, string|string[]>|null} current state value
 */
export const getCurrentQueryArguments = ( state ) => get( state, 'route.query.current', null );

export default getCurrentQueryArguments;
