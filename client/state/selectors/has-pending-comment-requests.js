/**
 * External dependencies
 */
import { get, some } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/comments/init';

/**
 * Returns true if we have any pending comment actions that we are tracking.
 *
 * @param {object} state - global application state
 * @returns {boolean} - true if we have pending actions
 */
export default ( state ) => {
	const pendingActions = get( state, [ 'comments', 'ui', 'pendingActions' ] );
	return some( pendingActions, ( requestKey ) => {
		return get( state, [ 'dataRequests', requestKey, 'status' ] ) === 'pending';
	} );
};
