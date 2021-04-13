/**
 * Dispatches the specified Redux action creator once enhancers have been applied to the result of its call. Enhancers
 * have access to the state tree and can be used to modify an action, e.g. to add an additional property to an analytics
 * event.
 *
 * @param {Function} actionCreator - Redux action creator function
 * @param {Function|Array} enhancers - either a single function or a list of functions that can be used to modify a Redux action
 * @returns {Function} enhanced action creator
 * @see client/state/analytics/actions/enhanceWithSiteType for an example
 * @see extendAction from @automattic/state-utils for a simpler alternative
 */
export const withEnhancers = ( actionCreator, enhancers ) => ( ...args ) => (
	dispatch,
	getState
) => {
	const action = actionCreator( ...args );

	if ( ! Array.isArray( enhancers ) ) {
		enhancers = [ enhancers ];
	}

	const enhanceAction = ( actionValue ) =>
		enhancers.reduce( ( result, enhancer ) => enhancer( result, getState ), actionValue );

	if ( typeof action === 'function' ) {
		const newDispatch = ( actionValue ) => dispatch( enhanceAction( actionValue ) );
		return action( newDispatch, getState );
	}

	return dispatch( enhanceAction( action ) );
};
