/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import courses from './courses/reducer';
import directly from './directly/reducer';
import ticket from './ticket/reducer';

export default combineReducers( {
	courses,
	directly,
	ticket,
} );
