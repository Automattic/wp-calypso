/**
 * Internal dependencies
 */
import courses from './courses/reducer';
import { combineReducers } from 'state/utils';
import directly from './directly/reducer';
import ticket from './ticket/reducer';

export default combineReducers( {
	courses,
	directly,
	ticket,
} );
