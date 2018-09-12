/** @format */

/**
 * Internal dependencies
 */

import posts from './posts/reducer';
import { combineReducers } from 'state/utils';
import lists from './lists/reducer';
import views from './views/posts/reducer';

export default combineReducers( {
	posts,
	lists,
	views,
} );
