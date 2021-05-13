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
export const withEnhancers = ( actionCreator, enhancers ) => ( ...args ) => {
	const action = actionCreator( ...args );

	if ( ! Array.isArray( enhancers ) ) {
		enhancers = [ enhancers ];
	}

	return ( dispatch, getState ) => {
		const enhanceAction = ( actionValue ) =>
			enhancers.reduce( ( result, enhancer ) => enhancer( result, getState ), actionValue );
		const enhancedDispatch = ( actionValue ) => dispatch( enhanceAction( actionValue ) );
		const thunkDispatch = ( actionValue ) => {
			if ( typeof actionValue === 'function' ) {
				return actionValue( thunkDispatch, getState );
			}

			return enhancedDispatch( actionValue );
		};

		return thunkDispatch( action );
	};
};
