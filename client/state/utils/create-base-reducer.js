// Utility method used by createReducer and createReducerWithValidation.
export function createBaseReducer( initialState, handlers ) {
	return ( state = initialState, action ) => {
		const { type } = action;

		if ( 'production' !== process.env.NODE_ENV && 'type' in action && ! type ) {
			throw new TypeError(
				'Reducer called with undefined type.' +
					' Verify that the action type is defined in state/action-types.js'
			);
		}

		if ( handlers.hasOwnProperty( type ) ) {
			return handlers[ type ]( state, action );
		}

		return state;
	};
}
