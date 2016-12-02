/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import courses from './courses/reducer';
import ticket from './ticket/reducer';

export default combineReducers( {
	courses,
	ticket,
} );
