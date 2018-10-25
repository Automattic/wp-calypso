/**
 * Default Publicize reducer state
 */
const DEFAULT_STATE = {
	connections: [],
	services: null,
};

/**
 * Reducer managing Publicize extension state.
 *
 * @param {Object} state  Current state.
 * @param {Object} action Dispatched action.
 *
 * @return {Object} Updated state.
 */
const reducer = ( state = DEFAULT_STATE, action ) => {
	switch ( action.type ) {
		case 'SET_CONNECTIONS':
			return {
				...state,
				connections: {
					...state.connections,
					[ action.postId ]: action.connections,
				},
			};
		case 'REFRESH_CONNECTIONS':
			return {
				...state,
				connections: DEFAULT_STATE.connections,
			};
		case 'SET_SERVICES':
			return {
				...state,
				services: action.services,
			};
	}

	return state;
}

export default reducer;
