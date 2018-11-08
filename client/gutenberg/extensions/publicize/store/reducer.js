/**
 * Reducer managing Publicize extension connections.
 *
 * @param {Object} state  Current state.
 * @param {Object} action Dispatched action.
 *
 * @return {Object} Updated state.
 */
function reducer( state = [], action ) {
	switch ( action.type ) {
		case 'SET_CONNECTIONS':
			return {
				...state,
				[ action.postId ]: action.connections,
			};
		case 'REFRESH_CONNECTIONS':
			return [];
	}

	return state;
}

export default reducer;
