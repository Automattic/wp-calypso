/**
 * External dependencies
 */
import { get, some } from 'lodash';

/**
 * Returns true if we have any pending comment actions that we are tracking.
 *
 * @param {object} state - global application state
 * @returns {boolean} - true if we have pending actions
 */
export default ( state ) => {
	const pendingActions = get( state, 'ui.comments.pendingActions' );
	return some( pendingActions, ( requestKey ) => {
		return get( state, [ 'dataRequests', requestKey, 'status' ] ) === 'pending';
	} );
};
