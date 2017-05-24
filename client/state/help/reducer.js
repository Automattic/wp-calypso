/**
 * Internal dependencies
 */
import courses from './courses/reducer';
import { combineReducersWithPersistence } from 'state/utils';
import directly from './directly/reducer';
import ticket from './ticket/reducer';

export default combineReducersWithPersistence( {
	courses,
	directly,
	ticket,
} );
