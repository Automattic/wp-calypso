/**
 * External dependencies
 */

import { findLast, last } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { ROUTE_SET } from 'state/action-types';

/**
 * Returns a log of actions from certain types that have previously been
 * dispatched for the current user.
 *
 * These actions are to be consumed by and inform Calypso's Guided Tours
 * framework, but other components interested in listening to a log of Calypso
 * actions are welcome to use and/or extend it.
 *
 * @param  {object}   state      Global state tree
 * @returns {Array}               Array of Redux actions, each with timestamp
 */
export function getActionLog( state ) {
	return state.ui.actionLog;
}

/**
 * Returns a log of ROUTE_SET actions that have previously been
 * dispatched for the current user.
 *
 * @param  {object}   state      Global state tree
 * @returns {Array}               Array of Redux actions of with a type of
 *                               ROUTE_SET, each with timestamp
 */
export const getRouteHistory = createSelector(
	( state ) => getActionLog( state ).filter( ( action ) => action.type === ROUTE_SET ),
	( state ) => [ state.ui.actionLog ]
);

/**
 * Returns the last ROUTE_SET action that had been dispatched for the current user.
 *
 * @param  {object}   state      Global state tree
 * @returns {object}              The last Redux action of type ROUTE_SET, with timestamp
 */
export const getLastRouteAction = createSelector(
	( state ) => findLast( getActionLog( state ), ( action ) => action.type === ROUTE_SET ),
	( state ) => [ state.ui.actionLog ]
);

/**
 * Returns the last item from the action log.
 *
 * @param  {object}   state      Global state tree
 * @returns {object}              The matching dispatched action
 */
export const getLastAction = createSelector(
	( state ) => last( state.ui.actionLog ) || false,
	( state ) => [ state.ui.actionLog ]
);
