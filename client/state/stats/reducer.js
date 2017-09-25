/**
 * Internal dependencies
 */
import lists from './lists/reducer';
import posts from './posts/reducer';
import { combineReducers } from 'state/utils';

export default combineReducers( {
	posts,
	lists
} );
