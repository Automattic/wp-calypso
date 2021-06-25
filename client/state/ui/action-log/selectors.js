/**
 * External dependencies
 */
import { last } from 'lodash';

/**
 * Internal dependencies
 */
import { createSelector } from '@automattic/state-utils';

import 'calypso/state/ui/init';

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
 * Returns the last item from the action log.
 *
 * @param  {object}   state      Global state tree
 * @returns {object}              The matching dispatched action
 */
export const getLastAction = createSelector(
	( state ) => last( state.ui.actionLog ) || false,
	( state ) => [ state.ui.actionLog ]
);
