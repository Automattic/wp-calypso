/**
 * Internal dependencies
 */
import posts from './posts/reducer';
import { combineReducersWithPersistence } from 'state/utils';
import lists from './lists/reducer';

export default combineReducersWithPersistence( {
	posts,
	lists
} );
