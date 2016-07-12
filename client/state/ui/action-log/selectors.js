/** @ssr-ready **/

/**
 * Returns a log of actions from certain types that have previously been
 * dispatched for the current user.
 *
 * These actions are to be consumed by and inform Calypso's Guided Tours
 * framework, but other components interested in listening to a log of Calypso
 * actions are welcome to use and/or extend it.
 *
 * @param  {Object}   state      Global state tree
 * @return {Array}               Array of Redux actions, each with timestamp
 */
export function getActionLog( state ) {
	return state.ui.actionLog;
}
