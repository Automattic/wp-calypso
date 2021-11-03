import { createSelector } from '@automattic/state-utils';
import { getRouteQueryCurrent } from 'calypso/state/route/query/selectors';
import 'calypso/state/route/init';

/**
 * Gets the last query parameters set by a ROUTE_SET action
 *
 * @param {object} state - global redux state
 * @returns {object} current state value
 */
export const getCurrentQueryArguments = createSelector(
	( state ) => getRouteQueryCurrent( state ) ?? {},
	[ getRouteQueryCurrent ]
);

export default getCurrentQueryArguments;
