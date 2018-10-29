/**
 * External dependencies
 */
import { combineReducers } from '@wordpress/data';

/**
 * Reducer managing Publicize extension connections.
 *
 * @param {Object} state  Current state.
 * @param {Object} action Dispatched action.
 *
 * @return {Object} Updated state.
 */
export function connections( state = [], action ) {
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

/**
 * Reducer managing Publicize extension services available for connection.
 *
 * @param {Object} state  Current state.
 * @param {Object} action Dispatched action.
 *
 * @return {Object} Updated state.
 */
export function services( state = null, action ) {
	switch ( action.type ) {
		case 'SET_SERVICES':
			return action.services;
	}

	return state;
}

export default combineReducers( {
	connections,
	services,
} );
