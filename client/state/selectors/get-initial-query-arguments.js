import { get } from 'lodash';

import 'calypso/state/route/init';

/**
 * Gets the initial query parameters set by a ROUTE_SET action
 *
 * @param {Object} state - global redux state
 * @returns {Object.<string, string> | null} initial query arguments
 */
export const getInitialQueryArguments = ( state ) => get( state, 'route.query.initial', null );

export default getInitialQueryArguments;
