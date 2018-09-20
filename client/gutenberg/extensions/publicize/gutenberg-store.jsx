/**
 * Publicize store for connection data
 *
 * Implements reducer, actions, and selector
 * for 'a8c/publicize' store.
 *
 * @since  5.9.1
 */

/**
 * Internal dependencies
 */
import { getStaticPublicizeConnections } from './async-publicize-lib';

/**
 * Module variables
 */
const staticConnectionList = getStaticPublicizeConnections();

const DEFAULT_STATE = {
	connections: staticConnectionList,
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
		 * @since 5.9.1
		 * @return {Object} action type 'GET_CONNECTIONS_START['
		 */
		getConnectionsStart() {
			return {
				type: 'GET_CONNECTIONS_START',
			};
		},

		/**
		 * Action function for when connection request fails
		 *
		 * @since 5.9.1
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
		 * @since 5.9.1
		 *
		 * @param {string} resultString JSON encoded result of connection request
		 * @return {Object} action type and (maybe) decoded JSON connection list
		 */
		getConnectionsDone( resultString ) {
			try {
				const result = JSON.parse( resultString );
				return {
					type: 'GET_CONNECTIONS_SUCCESS',
					result,
				};
			} catch ( e ) { // JSON parse fail.
				return {
					type: 'GET_CONNECTIONS_FAIL',
				};
			}
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
