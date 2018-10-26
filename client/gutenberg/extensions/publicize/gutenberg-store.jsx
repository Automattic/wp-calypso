/**
 * Publicize store for connection data
 *
 * Implements reducer, actions, and selector
 * for 'a8c/publicize' store.
 *
 * @format
 */

/**
 * Module variables
 */
const DEFAULT_STATE = {
	connections: null,
	isLoading: false,
	didFail: false,
};

const publicizeStore = {
	reducer( state = DEFAULT_STATE, action ) {
		switch ( action.type ) {
			case 'GET_CONNECTIONS_START':
				return {
					...state,
					isLoading: true,
					didFail: false,
				};
			case 'GET_CONNECTIONS_SUCCESS':
				return {
					...state,
					isLoading: false,
					didFail: false,
					connections: action.result,
				};
			case 'GET_CONNECTIONS_FAIL':
				return {
					...state,
					isLoading: false,
					didFail: true,
				};
		}
		return state;
	},

	actions: {
		/**
		 * Action function for when request for connections starts.
		 *
		 * @return {Object} action type 'GET_CONNECTIONS_START'
		 */
		getConnectionsStart() {
			return {
				type: 'GET_CONNECTIONS_START',
			};
		},

		/**
		 * Action function for when connection request fails
		 *
		 * @return {Object} action type 'GET_CONNECTIONS_FAIL'
		 */
		getConnectionsFail() {
			return {
				type: 'GET_CONNECTIONS_FAIL',
			};
		},

		/**
		 * Action function for when connection request finishes
		 *
		 * Updates component state in response to request finishing.
		 *
		 * @param {string} result Result of connection request
		 * @return {Object} action type 'GET_CONNECTIONS_SUCCESS' and connection list
		 */
		getConnectionsDone( result ) {
			return {
				type: 'GET_CONNECTIONS_SUCCESS',
				result,
			};
		},
	},

	selectors: {
		getConnections( state ) {
			return state.connections;
		},
		getIsLoading( state ) {
			return state.isLoading;
		},
		getDidFail( state ) {
			return state.didFail;
		},
	},
};

export default publicizeStore;
