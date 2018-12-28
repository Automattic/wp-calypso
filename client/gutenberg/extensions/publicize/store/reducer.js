/**
 * Reducer managing Publicize connection test results.
 *
 * @param {Object} state  Current state.
 * @param {Object} action Dispatched action.
 *
 * @return {Object} Updated state.
 */
export default function( state = [], action ) {
	switch ( action.type ) {
		case 'SET_CONNECTION_TEST_RESULTS':
			return action.results;
		case 'REFRESH_CONNECTION_TEST_RESULTS':
			return [];
	}

	return state;
}
