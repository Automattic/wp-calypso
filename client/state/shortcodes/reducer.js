/**
 * External dependencies
 */
import { combineReducers } from 'redux';

export function status( state = {} ) {
	return state;
}

export function shortcodes( state = {} ) {
	return state;
}

export default combineReducers( {
	status,
	shortcodes
} );
