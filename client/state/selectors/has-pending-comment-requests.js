import 'calypso/state/comments/init';

/**
 * Returns true if we have any pending comment actions that we are tracking.
 * @param {Object} state - global application state
 * @returns {boolean} - true if we have pending actions
 */
export default ( state ) => {
	const pendingActions = state?.comments?.ui?.pendingActions;
	return ( pendingActions ?? [] ).some( ( requestKey ) => {
		return state?.dataRequests?.[ requestKey ]?.status === 'pending';
	} );
};
